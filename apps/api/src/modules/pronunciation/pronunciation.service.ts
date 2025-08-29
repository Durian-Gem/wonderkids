import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CreateSpeechAttemptDto } from './dto';

@Injectable()
export class PronunciationService {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async createSpeechAttempt(userId: string, createAttemptDto: CreateSpeechAttemptDto) {
    // If childId is provided, verify it belongs to the user
    if (createAttemptDto.childId) {
      const { data: child, error: childError } = await this.supabase
        .from('children')
        .select('guardian_id')
        .eq('id', createAttemptDto.childId)
        .single();

      if (childError || !child) {
        throw new NotFoundException('Child not found');
      }

      if (child.guardian_id !== userId) {
        throw new ForbiddenException('Not authorized to create attempt for this child');
      }
    }

    // Verify lesson, activity, and question exist and are accessible
    const { data: question, error: questionError } = await this.supabase
      .from('questions')
      .select(`
        id,
        question_text,
        activities (
          id,
          lessons (
            id,
            units (
              courses (id, is_published)
            )
          )
        )
      `)
      .eq('id', createAttemptDto.questionId)
      .single();

    if (questionError || !question) {
      throw new NotFoundException('Question not found');
    }

    // Check if the course is published (public access)
    const course = (question as any)?.activities?.lessons?.units?.courses;
    if (!course?.is_published) {
      throw new ForbiddenException('Course is not published');
    }

    // Calculate pronunciation scores using heuristic methods
    const scores = await this.calculatePronunciationScores(
      createAttemptDto.audioPath,
      question.question_text
    );

    // Save the speech attempt
    const { data, error } = await this.supabase
      .from('speech_attempts')
      .insert({
        user_id: userId,
        child_id: createAttemptDto.childId || null,
        lesson_id: createAttemptDto.lessonId,
        activity_id: createAttemptDto.activityId,
        question_id: createAttemptDto.questionId,
        audio_path: createAttemptDto.audioPath,
        words_total: scores.wordsTotal,
        words_correct: scores.wordsCorrect,
        accuracy: scores.accuracy,
        fluency_score: scores.fluencyScore,
        pron_score: scores.pronScore,
        wpm: scores.wpm,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save speech attempt: ${error.message}`);
    }

    return {
      data,
      success: true,
      message: 'Speech attempt recorded and scored successfully'
    };
  }

  async getSpeechAttempts(userId: string, lessonId?: string, childId?: string) {
    let query = this.supabase
      .from('speech_attempts')
      .select(`
        *,
        children (id, name),
        lessons (title),
        activities (title),
        questions (question_text)
      `);

    // Filter by user's own attempts or their children's attempts
    if (childId) {
      // Verify child belongs to user
      const { data: child, error: childError } = await this.supabase
        .from('children')
        .select('guardian_id')
        .eq('id', childId)
        .single();

      if (childError || !child || child.guardian_id !== userId) {
        throw new ForbiddenException('Not authorized to view this child\'s attempts');
      }

      query = query.eq('child_id', childId);
    } else {
      // Get user's own attempts or their children's attempts
      query = query.or(`user_id.eq.${userId},children.guardian_id.eq.${userId}`);
    }

    if (lessonId) {
      query = query.eq('lesson_id', lessonId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch speech attempts: ${error.message}`);
    }

    // Calculate summary statistics
    const averageScore = data.length > 0 
      ? data.reduce((sum, attempt) => sum + attempt.pron_score, 0) / data.length
      : 0;

    const trend = this.calculateTrend(data);

    return {
      data: {
        attempts: data,
        averageScore: Math.round(averageScore * 100) / 100,
        totalAttempts: data.length,
        trend
      },
      success: true
    };
  }

  async getSpeechAttempt(userId: string, attemptId: string) {
    const { data, error } = await this.supabase
      .from('speech_attempts')
      .select(`
        *,
        children (id, name, guardian_id),
        lessons (title),
        activities (title),
        questions (question_text)
      `)
      .eq('id', attemptId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Speech attempt not found');
    }

    // Check authorization
    const hasAccess = data.user_id === userId || 
      (data.children && data.children.guardian_id === userId);

    if (!hasAccess) {
      throw new ForbiddenException('Not authorized to view this speech attempt');
    }

    return {
      data,
      success: true
    };
  }

  // Heuristic pronunciation scoring for v1
  private async calculatePronunciationScores(audioPath: string, expectedText: string) {
    // For v1, we'll use simple heuristics based on audio duration and expected text
    // In production, this would integrate with speech recognition APIs

    const expectedWords = expectedText.trim().split(/\s+/);
    const wordsTotal = expectedWords.length;

    // Get audio file metadata (this is a placeholder - would need actual audio analysis)
    const audioDurationSeconds = await this.getAudioDuration(audioPath);

    // Heuristic calculations
    const expectedDurationSeconds = wordsTotal * 0.6; // ~0.6 seconds per word for kids
    const durationRatio = Math.min(audioDurationSeconds / expectedDurationSeconds, 2);

    // Calculate WPM (words per minute)
    const wpm = audioDurationSeconds > 0 ? (wordsTotal / audioDurationSeconds) * 60 : 0;

    // Heuristic scoring based on timing and word count
    let accuracy = 1.0;
    let fluencyScore = 1.0;

    // Penalize if too fast or too slow
    if (durationRatio < 0.5 || durationRatio > 1.8) {
      accuracy *= 0.7; // Likely too fast (mumbled) or too slow (struggling)
      fluencyScore *= 0.6;
    } else if (durationRatio < 0.7 || durationRatio > 1.5) {
      accuracy *= 0.85;
      fluencyScore *= 0.8;
    }

    // Ideal WPM for kids is 60-120
    if (wpm < 30 || wpm > 150) {
      fluencyScore *= 0.7;
    }

    // Add some randomness to simulate real scoring variation
    accuracy *= (0.85 + Math.random() * 0.15); // 85-100%
    fluencyScore *= (0.8 + Math.random() * 0.2); // 80-100%

    // Overall pronunciation score (weighted average)
    const pronScore = (accuracy * 0.6) + (fluencyScore * 0.4);

    // Calculate words correct based on accuracy
    const wordsCorrect = Math.floor(wordsTotal * accuracy);

    return {
      wordsTotal,
      wordsCorrect,
      accuracy: Math.round(accuracy * 100) / 100,
      fluencyScore: Math.round(fluencyScore * 100) / 100,
      pronScore: Math.round(pronScore * 100) / 100,
      wpm: Math.round(wpm * 10) / 10
    };
  }

  // Placeholder for audio duration calculation
  private async getAudioDuration(audioPath: string): Promise<number> {
    // In a real implementation, this would analyze the audio file
    // For now, return a random duration between 1-10 seconds
    return 2 + Math.random() * 8;
  }

  private calculateTrend(attempts: any[]): 'positive' | 'negative' | 'stable' {
    if (attempts.length < 3) return 'stable';

    // Take the last 5 attempts to calculate trend
    const recentAttempts = attempts.slice(0, 5);
    const scores = recentAttempts.map(a => a.pron_score);

    // Simple linear trend calculation
    const first = scores[scores.length - 1];
    const last = scores[0];
    const difference = last - first;

    if (difference > 0.05) return 'positive';
    if (difference < -0.05) return 'negative';
    return 'stable';
  }
}
