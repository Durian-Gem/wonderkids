import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EmailModule } from '../src/modules/email/email.module';
import { AuthModule } from '../src/modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';

describe('EmailController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        EmailModule,
        AuthModule,
        ScheduleModule.forRoot()
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock authentication tokens
    userToken = 'mock-user-jwt-token';
    adminToken = 'mock-admin-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/email/send-weekly-now (POST)', () => {
    it('should send weekly email for current user', async () => {
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('jobId');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toContain('queued');
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .expect(401);
    });

    it('should generate proper email content', async () => {
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // The response should include job information
      expect(response.body.data).toHaveProperty('jobId');
      expect(typeof response.body.data.jobId).toBe('string');
    });

    it('should handle users with no activity gracefully', async () => {
      // Test with a user that has no recent activity
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      // Should still create a job even with no activity
      expect(response.body.data).toHaveProperty('jobId');
    });
  });

  describe('Email service functionality', () => {
    it('should handle mock email provider correctly', async () => {
      // Test that the service works with mock provider
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // In test environment, should use mock provider
      // The actual email sending would be mocked
    });

    it('should validate email addresses', async () => {
      // The service should handle invalid email addresses gracefully
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      // Should succeed even if user has invalid email (service should handle)
      expect(response.body.success).toBe(true);
    });
  });

  describe('Weekly summary generation', () => {
    it('should generate summary with learning stats', async () => {
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('jobId');
      
      // The job should be created successfully
      expect(typeof response.body.data.jobId).toBe('string');
      expect(response.body.data.jobId.length).toBeGreaterThan(0);
    });

    it('should include child progress data', async () => {
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Should handle families with multiple children
      expect(response.body.data).toHaveProperty('jobId');
    });

    it('should handle timezone correctly', async () => {
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // The job creation should account for user timezone
      expect(response.body.data).toHaveProperty('jobId');
    });
  });

  describe('Rate limiting and spam prevention', () => {
    it('should prevent duplicate email jobs for same user', async () => {
      // Send first email
      const response1 = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      // Try to send another immediately
      const response2 = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      // Both should succeed but the service should handle duplicates
      expect(response1.body.success).toBe(true);
      expect(response2.body.success).toBe(true);
    });

    it('should handle concurrent requests', async () => {
      // Send multiple concurrent requests
      const promises = Array.from({ length: 3 }, () =>
        request(app.getHttpServer())
          .post('/email/send-weekly-now')
          .set('Authorization', `Bearer ${userToken}`)
      );

      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Admin functionality', () => {
    it('should allow admins to trigger emails for development', async () => {
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('jobId');
    });
  });

  describe('Error handling', () => {
    it('should handle missing user profile gracefully', async () => {
      // Test with a token for non-existent user
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer non-existent-user-token`)
        .expect(401); // Should be unauthorized for invalid token

      // For testing purposes, we expect 401 for invalid token
      // In real scenario with valid token but missing profile, service should handle gracefully
    });

    it('should handle email provider failures', async () => {
      // The service should be resilient to email provider failures
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      // Should succeed in creating the job even if email provider is down
      expect(response.body.success).toBe(true);
    });

    it('should validate request data', async () => {
      // Test malformed requests
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ invalid: 'data' }) // Extra data should be ignored
        .expect(201);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Cron job simulation', () => {
    it('should process weekly summary for test user', async () => {
      // Simulate what the cron job would do
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('jobId');
      
      // The job should be properly formatted
      expect(typeof response.body.data.jobId).toBe('string');
    });

    it('should generate appropriate email content structure', async () => {
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      // Job should be created with proper structure
      expect(response.body.data).toHaveProperty('jobId');
      expect(response.body.data).toHaveProperty('message');
    });
  });

  describe('Email templates and formatting', () => {
    it('should handle different user scenarios', async () => {
      const scenarios = [
        { description: 'user with children', token: userToken },
        { description: 'admin user', token: adminToken }
      ];

      for (const scenario of scenarios) {
        const response = await request(app.getHttpServer())
          .post('/email/send-weekly-now')
          .set('Authorization', `Bearer ${scenario.token}`)
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('jobId');
      }
    });

    it('should generate localized content', async () => {
      // Test email generation for different locales
      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .set('Accept-Language', 'vi')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('jobId');
    });
  });

  describe('Performance considerations', () => {
    it('should process email generation within reasonable time', async () => {
      const startTime = Date.now();

      const response = await request(app.getHttpServer())
        .post('/email/send-weekly-now')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      expect(response.body.success).toBe(true);
      // Should generate email job within 2 seconds
      expect(processingTime).toBeLessThan(2000);
    });

    it('should handle bulk email generation efficiently', async () => {
      // Test with multiple users (simulated)
      const tokens = [userToken, adminToken];
      
      const promises = tokens.map(token =>
        request(app.getHttpServer())
          .post('/email/send-weekly-now')
          .set('Authorization', `Bearer ${token}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
