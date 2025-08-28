import { Injectable, NotFoundException, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateAttemptDto } from './dto/create-attempt.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
import { ReviewService } from '../review/review.service';

@Injectable()
export class AttemptsService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  constructor(
    @Inject(forwardRef(() => ReviewService))
    private reviewService: ReviewService
  ) {}

  async createAttempt(createAttemptDto: CreateAttemptDto, userId: string) {
    try {
      // Verify lesson exists and is published
      const { data: lesson, error: lessonError } = await this.supabase
        .from('lessons')
        .select('id')
        .eq('id', createAttemptDto.lessonId)
        .eq('is_published', true)
        .single();

      if (lessonError || !lesson) {
        throw new NotFoundException('Lesson not found');
      }

      // If childId is provided, verify the user is the guardian
      if (createAttemptDto.childId) {
        const { data: child, error: childError } = await this.supabase
          .from('children')
          .select('id')
          .eq('id', createAttemptDto.childId)
          .eq('guardian_id', userId)
          .single();

        if (childError || !child) {
          throw new UnauthorizedException('Child not found or not authorized');
        }
      }

      // Create attempt
      const { data: attempt, error: attemptError } = await this.supabase
        .from('attempts')
        .insert({
          user_id: createAttemptDto.childId ? null : userId,
          child_id: createAttemptDto.childId || null,
          lesson_id: createAttemptDto.lessonId
        })
        .select()
        .single();

      if (attemptError) {
        throw new Error(`Failed to create attempt: ${attemptError.message}`);
      }

      return { data: { attemptId: attempt.id }, success: true };
    } catch (err) {
      console.error('Service error:', err);
      throw err;
    }
  }

  async submitAnswers(attemptId: string, submitAnswersDto: SubmitAnswersDto, userId: string) {
    try {
      // Verify attempt belongs to user and get lesson data
      const { data: attempt, error: attemptError } = await this.supabase
        .from('attempts')
        .select(`
          *,
          lesson:lessons(
            *,
            activities:activities(
              *,
              questions:questions(
                *,
                options:options(*)
              )
            )
          )
        `)
        .eq('id', attemptId)
        .single();

      if (attemptError || !attempt) {
        throw new NotFoundException('Attempt not found');
      }

      // Verify user has access to this attempt
      const hasAccess = attempt.user_id === userId || 
        (attempt.child_id && await this.verifyChildAccess(attempt.child_id, userId));

      if (!hasAccess) {
        throw new UnauthorizedException('Not authorized to access this attempt');
      }

      // Process and save answers
      const answersToInsert = [];
      for (const answerDto of submitAnswersDto.answers) {
        const question = this.findQuestionInLesson(attempt.lesson, answerDto.questionId);
        if (!question) {
          continue; // Skip invalid questions
        }

        const isCorrect = this.scoreAnswer(question, answerDto.response);
        
        answersToInsert.push({
          attempt_id: attemptId,
          question_id: answerDto.questionId,
          response: answerDto.response,
          is_correct: isCorrect
        });
      }

      // Insert answers (upsert to handle retries)
      const { error: answersError } = await this.supabase
        .from('answers')
        .upsert(answersToInsert, {
          onConflict: 'attempt_id,question_id'
        });

      if (answersError) {
        throw new Error(`Failed to save answers: ${answersError.message}`);
      }

      return { success: true };
    } catch (err) {
      console.error('Service error:', err);
      throw err;
    }
  }

  async finishAttempt(attemptId: string, userId: string) {
    try {
      // Get attempt with answers and lesson data
      const { data: attempt, error: attemptError } = await this.supabase
        .from('attempts')
        .select(`
          *,
          answers:answers(*),
          lesson:lessons(
            *,
            activities:activities(
              *,
              questions:questions(*)
            )
          )
        `)
        .eq('id', attemptId)
        .single();

      if (attemptError || !attempt) {
        throw new NotFoundException('Attempt not found');
      }

      // Verify user has access
      const hasAccess = attempt.user_id === userId || 
        (attempt.child_id && await this.verifyChildAccess(attempt.child_id, userId));

      if (!hasAccess) {
        throw new UnauthorizedException('Not authorized to access this attempt');
      }

      // Calculate duration in seconds
      const startedAt = new Date(attempt.started_at);
      const completedAt = new Date();
      const durationSec = Math.round((completedAt.getTime() - startedAt.getTime()) / 1000);

      // Calculate score
      const totalQuestions = attempt.lesson.activities.reduce(
        (sum, activity) => sum + activity.questions.length, 0
      );
      const correctAnswers = attempt.answers.filter(answer => answer.is_correct).length;
      const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

      // XP calculation: +5 per correct question, +10 lesson completion bonus
      const xpAwarded = (correctAnswers * 5) + (score >= 70 ? 10 : 0);

      // Update attempt with duration
      const { error: updateError } = await this.supabase
        .from('attempts')
        .update({
          completed_at: completedAt.toISOString(),
          score: score,
          duration_sec: durationSec
        })
        .eq('id', attemptId);

      if (updateError) {
        throw new Error(`Failed to update attempt: ${updateError.message}`);
      }

      // Create XP event
      await this.supabase
        .from('xp_events')
        .insert({
          user_id: attempt.user_id,
          child_id: attempt.child_id,
          reason: 'lesson_completion',
          amount: xpAwarded
        });

      // Update/create progress
      await this.supabase
        .from('progress')
        .upsert({
          user_id: attempt.user_id,
          child_id: attempt.child_id,
          lesson_id: attempt.lesson_id,
          status: score >= 70 ? 'completed' : 'in_progress',
          stars: score >= 90 ? 3 : score >= 80 ? 2 : score >= 70 ? 1 : 0,
          mastery: score / 100,
          last_activity_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,child_id,lesson_id',
          ignoreDuplicates: false
        });

      // Calculate streak (simplified - check if there was activity in last 24h)
      const streak = await this.calculateStreak(attempt.user_id, attempt.child_id);

      // Check and award badges
      await this.checkAndAwardBadges(attempt.user_id, attempt.child_id);

      // Create review items for spaced repetition
      try {
        const answersForReview = attempt.answers.map(answer => ({
          questionId: answer.question_id,
          isCorrect: answer.is_correct
        }));

        await this.reviewService.createReviewItemsFromAttempt(
          attempt.user_id || userId,
          attempt.child_id,
          attempt.lesson_id,
          answersForReview
        );
      } catch (reviewError) {
        console.error('Error creating review items:', reviewError);
        // Don't fail the attempt if review creation fails
      }

      return {
        data: {
          score: Math.round(score),
          xpAwarded,
          streak,
          correctAnswers,
          totalQuestions
        },
        success: true
      };
    } catch (err) {
      console.error('Service error:', err);
      throw err;
    }
  }

  private async verifyChildAccess(childId: string, userId: string): Promise<boolean> {
    const { data: child } = await this.supabase
      .from('children')
      .select('id')
      .eq('id', childId)
      .eq('guardian_id', userId)
      .single();
    return !!child;
  }

  private findQuestionInLesson(lesson: any, questionId: string): any {
    for (const activity of lesson.activities) {
      const question = activity.questions.find(q => q.id === questionId);
      if (question) {
        return { ...question, activity };
      }
    }
    return null;
  }

  private scoreAnswer(question: any, response: any): boolean {
    const activityKind = question.activity.kind;

    switch (activityKind) {
      case 'quiz_mcq':
        return this.scoreMCQ(question, response);
      case 'listen_choose':
        return this.scoreListenChoose(question, response);
      case 'match_pairs':
        return this.scoreMatchPairs(question, response);
      case 'fill_blank':
        return this.scoreFillBlank(question, response);
      case 'order':
        return this.scoreOrder(question, response);
      default:
        return false;
    }
  }

  private scoreMCQ(question: any, response: any): boolean {
    const correctOptions = question.options
      .filter(option => option.is_correct)
      .map(option => option.label.text);
    
    const selectedOptions = response.selectedOptions || [];
    
    // All correct choices selected and no incorrect ones
    return correctOptions.length === selectedOptions.length &&
           correctOptions.every(correct => selectedOptions.includes(correct));
  }

  private scoreListenChoose(question: any, response: any): boolean {
    const correctAnswer = question.answer?.correct?.[0];
    const selectedAnswer = response.selectedOption;
    
    return correctAnswer === selectedAnswer;
  }

  private scoreMatchPairs(question: any, response: any): boolean {
    const correctPairs = question.answer?.pairs || [];
    const submittedPairs = response.pairs || [];
    
    // All pairs must match exactly
    if (correctPairs.length !== submittedPairs.length) {
      return false;
    }
    
    return correctPairs.every(([left, right]) => {
      return submittedPairs.some(([sLeft, sRight]) => 
        sLeft === left && sRight === right
      );
    });
  }

  private async calculateStreak(userId: string | null, childId: string | null): Promise<number> {
    // Simple streak calculation - check recent progress updates
    const { data: recentProgress } = await this.supabase
      .from('progress')
      .select('last_activity_at')
      .eq('user_id', userId)
      .eq('child_id', childId)
      .gte('last_activity_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('last_activity_at', { ascending: false });

    // For MVP, return 1 if there's recent activity, otherwise 1 (new streak)
    return recentProgress && recentProgress.length > 0 ? 2 : 1;
  }

  private async checkAndAwardBadges(userId: string | null, childId: string | null) {
    try {
      // Get completed lessons count
      const { data: completedLessons } = await this.supabase
        .from('progress')
        .select('id')
        .eq('user_id', userId)
        .eq('child_id', childId)
        .eq('status', 'completed');

      const completedCount = completedLessons?.length || 0;

      // Get existing badges
      const { data: existingBadges } = await this.supabase
        .from('user_badges')
        .select('badge:badges(code)')
        .eq('user_id', userId)
        .eq('child_id', childId);

      const existingBadgeCodes = existingBadges?.map(ub => (ub as any).badge.code) || [];

      // Award badges
      const badgesToAward = [];

      if (completedCount >= 1 && !existingBadgeCodes.includes('FIRST_LESSON')) {
        badgesToAward.push('FIRST_LESSON');
      }

      if (completedCount >= 5 && !existingBadgeCodes.includes('FIVE_LESSONS')) {
        badgesToAward.push('FIVE_LESSONS');
      }

      // Award new badges
      for (const badgeCode of badgesToAward) {
        const { data: badge } = await this.supabase
          .from('badges')
          .select('id')
          .eq('code', badgeCode)
          .single();

        if (badge) {
          await this.supabase
            .from('user_badges')
            .insert({
              user_id: userId,
              child_id: childId,
              badge_id: badge.id
            });
        }
      }
    } catch (err) {
      console.error('Badge awarding error:', err);
      // Don't throw - badge errors shouldn't fail the attempt
    }
  }

  private scoreFillBlank(question: any, response: any): boolean {
    const correctAnswers = question.answer?.correct || [];
    const userAnswers = response.answers || [];

    // Check if all blanks are filled correctly
    if (correctAnswers.length !== userAnswers.length) {
      return false;
    }

    return correctAnswers.every((correct, index) => {
      const userAnswer = userAnswers[index];
      if (!userAnswer || !correct) {
        return false;
      }

      // Normalize answers: trim whitespace, convert to lowercase
      const normalizedCorrect = correct.toLowerCase().trim();
      const normalizedUser = userAnswer.toLowerCase().trim();

      // Exact match
      if (normalizedCorrect === normalizedUser) {
        return true;
      }

      // Optional: Allow for small typos (Levenshtein distance <= 1)
      return this.calculateLevenshteinDistance(normalizedCorrect, normalizedUser) <= 1;
    });
  }

  private scoreOrder(question: any, response: any): boolean {
    const correctOrder = question.answer?.correct || [];
    const userOrder = response.order || [];

    // Must have same length and exact order
    if (correctOrder.length !== userOrder.length) {
      return false;
    }

    return correctOrder.every((item, index) => item === userOrder[index]);
  }

  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}
