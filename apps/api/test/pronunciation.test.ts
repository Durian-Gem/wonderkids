import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PronunciationModule } from '../src/modules/pronunciation/pronunciation.module';
import { AuthModule } from '../src/modules/auth/auth.module';

describe('PronunciationController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  // Mock test data
  const mockLessonId = 'mock-lesson-id';
  const mockActivityId = 'mock-activity-id';
  const mockQuestionId = 'mock-question-id';
  const mockChildId = 'mock-child-id';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PronunciationModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock authentication
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/pronunciation/attempts (POST)', () => {
    it('should create a speech attempt and return scores', async () => {
      const createAttemptDto = {
        lessonId: mockLessonId,
        activityId: mockActivityId,
        questionId: mockQuestionId,
        audioPath: 'recordings/user/child/audio.webm'
      };

      const response = await request(app.getHttpServer())
        .post('/pronunciation/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createAttemptDto)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('lessonId', mockLessonId);
      expect(response.body.data).toHaveProperty('activityId', mockActivityId);
      expect(response.body.data).toHaveProperty('questionId', mockQuestionId);
      expect(response.body.data).toHaveProperty('audioPath');
      
      // Check scoring results
      expect(response.body.data).toHaveProperty('accuracy');
      expect(response.body.data).toHaveProperty('fluencyScore');
      expect(response.body.data).toHaveProperty('pronScore');
      expect(response.body.data).toHaveProperty('wpm');
      expect(response.body.data).toHaveProperty('wordsTotal');
      expect(response.body.data).toHaveProperty('wordsCorrect');

      // Scores should be between 0 and 1
      expect(response.body.data.accuracy).toBeGreaterThanOrEqual(0);
      expect(response.body.data.accuracy).toBeLessThanOrEqual(1);
      expect(response.body.data.fluencyScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.fluencyScore).toBeLessThanOrEqual(1);
      expect(response.body.data.pronScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.pronScore).toBeLessThanOrEqual(1);
    });

    it('should validate required fields', async () => {
      const invalidDto = {
        lessonId: mockLessonId,
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/pronunciation/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDto)
        .expect(400);
    });

    it('should reject invalid audio paths', async () => {
      const createAttemptDto = {
        lessonId: mockLessonId,
        activityId: mockActivityId,
        questionId: mockQuestionId,
        audioPath: '../../../etc/passwd' // Path traversal attempt
      };

      await request(app.getHttpServer())
        .post('/pronunciation/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createAttemptDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      const createAttemptDto = {
        lessonId: mockLessonId,
        activityId: mockActivityId,
        questionId: mockQuestionId,
        audioPath: 'recordings/user/child/audio.webm'
      };

      await request(app.getHttpServer())
        .post('/pronunciation/attempts')
        .send(createAttemptDto)
        .expect(401);
    });

    it('should return 404 for non-existent question', async () => {
      const createAttemptDto = {
        lessonId: mockLessonId,
        activityId: mockActivityId,
        questionId: 'non-existent-question',
        audioPath: 'recordings/user/child/audio.webm'
      };

      await request(app.getHttpServer())
        .post('/pronunciation/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createAttemptDto)
        .expect(404);
    });
  });

  describe('/pronunciation/attempts (GET)', () => {
    beforeEach(async () => {
      // Create some test attempts
      const attempts = [
        {
          lessonId: mockLessonId,
          activityId: mockActivityId,
          questionId: mockQuestionId,
          audioPath: 'recordings/user/child/audio1.webm'
        },
        {
          lessonId: mockLessonId,
          activityId: mockActivityId,
          questionId: 'another-question-id',
          audioPath: 'recordings/user/child/audio2.webm'
        }
      ];

      for (const attempt of attempts) {
        await request(app.getHttpServer())
          .post('/pronunciation/attempts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(attempt);
      }
    });

    it('should get all attempts for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/pronunciation/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      // Check attempt structure
      const attempt = response.body.data[0];
      expect(attempt).toHaveProperty('id');
      expect(attempt).toHaveProperty('lessonId');
      expect(attempt).toHaveProperty('audioPath');
      expect(attempt).toHaveProperty('accuracy');
      expect(attempt).toHaveProperty('createdAt');
    });

    it('should filter attempts by lessonId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pronunciation/attempts?lessonId=${mockLessonId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      
      // All attempts should have the specified lessonId
      response.body.data.forEach((attempt: any) => {
        expect(attempt.lessonId).toBe(mockLessonId);
      });
    });

    it('should filter attempts by childId', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pronunciation/attempts?childId=${mockChildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should combine filters', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pronunciation/attempts?lessonId=${mockLessonId}&childId=${mockChildId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/pronunciation/attempts')
        .expect(401);
    });
  });

  describe('/pronunciation/attempts/:id (GET)', () => {
    let attemptId: string;

    beforeEach(async () => {
      // Create a test attempt
      const createResponse = await request(app.getHttpServer())
        .post('/pronunciation/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lessonId: mockLessonId,
          activityId: mockActivityId,
          questionId: mockQuestionId,
          audioPath: 'recordings/user/child/audio.webm'
        });
      
      attemptId = createResponse.body.data.id;
    });

    it('should get specific attempt by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pronunciation/attempts/${attemptId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', attemptId);
      expect(response.body.data).toHaveProperty('lessonId', mockLessonId);
      expect(response.body.data).toHaveProperty('accuracy');
      expect(response.body.data).toHaveProperty('fluencyScore');
      expect(response.body.data).toHaveProperty('pronScore');
    });

    it('should return 404 for non-existent attempt', async () => {
      await request(app.getHttpServer())
        .get('/pronunciation/attempts/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`/pronunciation/attempts/${attemptId}`)
        .expect(401);
    });
  });

  describe('Scoring algorithm validation', () => {
    it('should return consistent scoring for similar content', async () => {
      const createAttemptDto = {
        lessonId: mockLessonId,
        activityId: mockActivityId,
        questionId: mockQuestionId,
        audioPath: 'recordings/user/child/consistent-audio.webm'
      };

      // Create multiple attempts with same content
      const responses = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/pronunciation/attempts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...createAttemptDto,
            audioPath: `recordings/user/child/audio-${i}.webm`
          });
        responses.push(response.body.data);
      }

      // Scores should be somewhat consistent (within reasonable range)
      const accuracyScores = responses.map(r => r.accuracy);
      const maxAccuracy = Math.max(...accuracyScores);
      const minAccuracy = Math.min(...accuracyScores);
      
      // Heuristic scoring might have some variance, but shouldn't be extreme
      expect(maxAccuracy - minAccuracy).toBeLessThan(0.3);
    });

    it('should handle edge cases in scoring', async () => {
      const edgeCases = [
        { audioPath: 'recordings/user/child/very-short.webm', description: 'very short audio' },
        { audioPath: 'recordings/user/child/very-long.webm', description: 'very long audio' },
        { audioPath: 'recordings/user/child/silent.webm', description: 'silent audio' },
      ];

      for (const edgeCase of edgeCases) {
        const response = await request(app.getHttpServer())
          .post('/pronunciation/attempts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            lessonId: mockLessonId,
            activityId: mockActivityId,
            questionId: mockQuestionId,
            audioPath: edgeCase.audioPath
          })
          .expect(201);

        // Scores should still be valid even for edge cases
        expect(response.body.data.accuracy).toBeGreaterThanOrEqual(0);
        expect(response.body.data.accuracy).toBeLessThanOrEqual(1);
        expect(response.body.data.fluencyScore).toBeGreaterThanOrEqual(0);
        expect(response.body.data.fluencyScore).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('Performance and limitations', () => {
    it('should handle multiple concurrent attempts', async () => {
      const attempts = Array.from({ length: 5 }, (_, i) => ({
        lessonId: mockLessonId,
        activityId: mockActivityId,
        questionId: mockQuestionId,
        audioPath: `recordings/user/child/concurrent-${i}.webm`
      }));

      // Send all requests concurrently
      const promises = attempts.map(attempt =>
        request(app.getHttpServer())
          .post('/pronunciation/attempts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(attempt)
      );

      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    it('should process attempts within reasonable time', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer())
        .post('/pronunciation/attempts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          lessonId: mockLessonId,
          activityId: mockActivityId,
          questionId: mockQuestionId,
          audioPath: 'recordings/user/child/timing-test.webm'
        })
        .expect(201);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process within 5 seconds (adjust based on your requirements)
      expect(processingTime).toBeLessThan(5000);
    });
  });
});
