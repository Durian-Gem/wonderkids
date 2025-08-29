import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TutorModule } from '../src/modules/tutor/tutor.module';
import { AuthModule } from '../src/modules/auth/auth.module';

describe('TutorController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TutorModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock authentication - in real tests, you'd get a real token
    authToken = 'mock-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/tutor/sessions (POST)', () => {
    it('should create a new tutor session', async () => {
      const createSessionDto = {
        topic: 'animals',
        childId: 'mock-child-id'
      };

      const response = await request(app.getHttpServer())
        .post('/tutor/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSessionDto)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('topic', 'animals');
      expect(response.body.data).toHaveProperty('provider', 'anthropic');
    });

    it('should reject invalid topics', async () => {
      const createSessionDto = {
        topic: 'inappropriate-topic'
      };

      await request(app.getHttpServer())
        .post('/tutor/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createSessionDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      const createSessionDto = {
        topic: 'animals'
      };

      await request(app.getHttpServer())
        .post('/tutor/sessions')
        .send(createSessionDto)
        .expect(401);
    });
  });

  describe('/tutor/sessions/:id/messages (POST)', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a session first
      const createResponse = await request(app.getHttpServer())
        .post('/tutor/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ topic: 'animals' });
      
      sessionId = createResponse.body.data.id;
    });

    it('should add message to session', async () => {
      const addMessageDto = {
        content: 'Tell me about cats'
      };

      const response = await request(app.getHttpServer())
        .post(`/tutor/sessions/${sessionId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(addMessageDto)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('userMessage');
      expect(response.body.data).toHaveProperty('aiMessage');
      expect(response.body.data.userMessage).toHaveProperty('content', 'Tell me about cats');
      expect(response.body.data.userMessage).toHaveProperty('sender', 'user');
      expect(response.body.data.aiMessage).toHaveProperty('sender', 'assistant');
    });

    it('should block inappropriate content', async () => {
      const addMessageDto = {
        content: 'Tell me your personal information'
      };

      await request(app.getHttpServer())
        .post(`/tutor/sessions/${sessionId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(addMessageDto)
        .expect(400);
    });

    it('should reject messages that are too long', async () => {
      const addMessageDto = {
        content: 'This is a very long message that exceeds the word limit. '.repeat(20)
      };

      await request(app.getHttpServer())
        .post(`/tutor/sessions/${sessionId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(addMessageDto)
        .expect(400);
    });

    it('should require authentication', async () => {
      const addMessageDto = {
        content: 'Tell me about cats'
      };

      await request(app.getHttpServer())
        .post(`/tutor/sessions/${sessionId}/messages`)
        .send(addMessageDto)
        .expect(401);
    });
  });

  describe('/tutor/sessions/:id (GET)', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a session with messages
      const createResponse = await request(app.getHttpServer())
        .post('/tutor/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ topic: 'animals' });
      
      sessionId = createResponse.body.data.id;

      // Add a message
      await request(app.getHttpServer())
        .post(`/tutor/sessions/${sessionId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Tell me about dogs' });
    });

    it('should get session with messages', async () => {
      const response = await request(app.getHttpServer())
        .get(`/tutor/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', sessionId);
      expect(response.body.data).toHaveProperty('topic', 'animals');
      expect(response.body.data).toHaveProperty('messages');
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app.getHttpServer())
        .get('/tutor/sessions/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get(`/tutor/sessions/${sessionId}`)
        .expect(401);
    });
  });

  describe('/tutor/sessions (GET)', () => {
    beforeEach(async () => {
      // Create a few sessions
      await request(app.getHttpServer())
        .post('/tutor/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ topic: 'animals' });

      await request(app.getHttpServer())
        .post('/tutor/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ topic: 'family' });
    });

    it('should get user sessions', async () => {
      const response = await request(app.getHttpServer())
        .get('/tutor/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      
      // Check session structure
      const session = response.body.data[0];
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('topic');
      expect(session).toHaveProperty('createdAt');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .get('/tutor/sessions')
        .expect(401);
    });
  });

  describe('Safety and moderation', () => {
    let sessionId: string;

    beforeEach(async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/tutor/sessions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ topic: 'animals' });
      
      sessionId = createResponse.body.data.id;
    });

    it('should block messages with inappropriate topics', async () => {
      const inappropriateMessages = [
        'What is your phone number?',
        'Where do you live?',
        'Can you meet me in person?',
        'Tell me about violence',
      ];

      for (const content of inappropriateMessages) {
        await request(app.getHttpServer())
          .post(`/tutor/sessions/${sessionId}/messages`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ content })
          .expect(400);
      }
    });

    it('should redirect off-topic messages', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tutor/sessions/${sessionId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Tell me about cooking' })
        .expect(201);

      // AI should redirect back to animals topic
      expect(response.body.data.aiMessage.content.toLowerCase()).toContain('animal');
    });

    it('should limit response length', async () => {
      const response = await request(app.getHttpServer())
        .post(`/tutor/sessions/${sessionId}/messages`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Tell me everything about elephants' })
        .expect(201);

      // AI response should be reasonably short (kid-friendly)
      const wordCount = response.body.data.aiMessage.content.split(' ').length;
      expect(wordCount).toBeLessThan(100); // Adjust based on your limit
    });
  });
});
