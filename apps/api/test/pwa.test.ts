import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PWAModule } from '../src/modules/pwa/pwa.module';
import { AuthModule } from '../src/modules/auth/auth.module';

describe('PWAController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PWAModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock authentication tokens
    adminToken = 'mock-admin-jwt-token';
    userToken = 'mock-user-jwt-token';
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/pwa/packs (GET)', () => {
    it('should get published packs without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/pwa/packs')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toBeInstanceOf(Array);

      // Check pack structure if any exist
      if (response.body.data.length > 0) {
        const pack = response.body.data[0];
        expect(pack).toHaveProperty('id');
        expect(pack).toHaveProperty('code');
        expect(pack).toHaveProperty('title');
        expect(pack).toHaveProperty('assets');
        expect(pack).toHaveProperty('isPublished', true);
        expect(Array.isArray(pack.assets)).toBe(true);
      }
    });

    it('should only return published packs', async () => {
      const response = await request(app.getHttpServer())
        .get('/pwa/packs')
        .expect(200);

      // All returned packs should be published
      response.body.data.forEach((pack: any) => {
        expect(pack.isPublished).toBe(true);
      });
    });

    it('should include valid asset structure', async () => {
      const response = await request(app.getHttpServer())
        .get('/pwa/packs')
        .expect(200);

      if (response.body.data.length > 0) {
        const pack = response.body.data[0];
        
        if (pack.assets.length > 0) {
          const asset = pack.assets[0];
          expect(asset).toHaveProperty('url');
          expect(asset).toHaveProperty('hash');
          expect(asset).toHaveProperty('bytes');
          expect(asset).toHaveProperty('kind');
          expect(['audio', 'image', 'lesson', 'activity', 'other']).toContain(asset.kind);
        }
      }
    });
  });

  describe('/pwa/packs/:code (GET)', () => {
    const testPackCode = 'a1-u1';

    it('should get specific pack by code', async () => {
      const response = await request(app.getHttpServer())
        .get(`/pwa/packs/${testPackCode}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('code', testPackCode);
      expect(response.body.data).toHaveProperty('title');
      expect(response.body.data).toHaveProperty('assets');
      expect(response.body.data).toHaveProperty('isPublished', true);
    });

    it('should return 404 for non-existent pack', async () => {
      await request(app.getHttpServer())
        .get('/pwa/packs/non-existent-pack')
        .expect(404);
    });

    it('should return 404 for unpublished pack', async () => {
      await request(app.getHttpServer())
        .get('/pwa/packs/unpublished-pack')
        .expect(404);
    });
  });

  describe('Admin endpoints', () => {
    describe('/pwa/admin/packs (POST)', () => {
      it('should create new content pack as admin', async () => {
        const createPackDto = {
          code: 'test-pack-1',
          title: 'Test Pack 1',
          description: 'A test content pack',
          assets: [
            {
              url: 'https://example.com/audio1.mp3',
              hash: 'abc123',
              bytes: 1024000,
              kind: 'audio'
            },
            {
              url: 'https://example.com/lesson1.json',
              hash: 'def456',
              bytes: 5120,
              kind: 'lesson'
            }
          ],
          isPublished: false
        };

        const response = await request(app.getHttpServer())
          .post('/pwa/admin/packs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(createPackDto)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('code', 'test-pack-1');
        expect(response.body.data).toHaveProperty('title', 'Test Pack 1');
        expect(response.body.data).toHaveProperty('isPublished', false);
        expect(response.body.data.assets).toHaveLength(2);
      });

      it('should reject invalid asset structure', async () => {
        const invalidPackDto = {
          code: 'invalid-pack',
          title: 'Invalid Pack',
          assets: [
            {
              url: 'https://example.com/audio1.mp3',
              // Missing required fields
            }
          ]
        };

        await request(app.getHttpServer())
          .post('/pwa/admin/packs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(invalidPackDto)
          .expect(400);
      });

      it('should reject duplicate pack codes', async () => {
        const duplicatePackDto = {
          code: 'a1-u1', // Assuming this already exists
          title: 'Duplicate Pack',
          assets: []
        };

        await request(app.getHttpServer())
          .post('/pwa/admin/packs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(duplicatePackDto)
          .expect(409);
      });

      it('should require admin authentication', async () => {
        const createPackDto = {
          code: 'unauthorized-pack',
          title: 'Unauthorized Pack',
          assets: []
        };

        await request(app.getHttpServer())
          .post('/pwa/admin/packs')
          .set('Authorization', `Bearer ${userToken}`)
          .send(createPackDto)
          .expect(403);

        await request(app.getHttpServer())
          .post('/pwa/admin/packs')
          .send(createPackDto)
          .expect(401);
      });
    });

    describe('/pwa/admin/packs/:id (PUT)', () => {
      let packId: string;

      beforeEach(async () => {
        // Create a test pack first
        const createResponse = await request(app.getHttpServer())
          .post('/pwa/admin/packs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            code: 'update-test-pack',
            title: 'Update Test Pack',
            assets: []
          });
        
        packId = createResponse.body.data.id;
      });

      it('should update existing pack as admin', async () => {
        const updatePackDto = {
          title: 'Updated Test Pack',
          description: 'Updated description',
          assets: [
            {
              url: 'https://example.com/new-audio.mp3',
              hash: 'xyz789',
              bytes: 2048000,
              kind: 'audio'
            }
          ],
          isPublished: true
        };

        const response = await request(app.getHttpServer())
          .put(`/pwa/admin/packs/${packId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send(updatePackDto)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('id', packId);
        expect(response.body.data).toHaveProperty('title', 'Updated Test Pack');
        expect(response.body.data).toHaveProperty('description', 'Updated description');
        expect(response.body.data).toHaveProperty('isPublished', true);
        expect(response.body.data.assets).toHaveLength(1);
      });

      it('should return 404 for non-existent pack', async () => {
        await request(app.getHttpServer())
          .put('/pwa/admin/packs/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ title: 'Update' })
          .expect(404);
      });

      it('should require admin authentication', async () => {
        await request(app.getHttpServer())
          .put(`/pwa/admin/packs/${packId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .send({ title: 'Unauthorized Update' })
          .expect(403);
      });
    });

    describe('/pwa/admin/packs/:id (DELETE)', () => {
      let packId: string;

      beforeEach(async () => {
        // Create a test pack first
        const createResponse = await request(app.getHttpServer())
          .post('/pwa/admin/packs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            code: 'delete-test-pack',
            title: 'Delete Test Pack',
            assets: []
          });
        
        packId = createResponse.body.data.id;
      });

      it('should delete pack as admin', async () => {
        await request(app.getHttpServer())
          .delete(`/pwa/admin/packs/${packId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Verify pack is deleted
        await request(app.getHttpServer())
          .get(`/pwa/packs/delete-test-pack`)
          .expect(404);
      });

      it('should return 404 for non-existent pack', async () => {
        await request(app.getHttpServer())
          .delete('/pwa/admin/packs/non-existent-id')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });

      it('should require admin authentication', async () => {
        await request(app.getHttpServer())
          .delete(`/pwa/admin/packs/${packId}`)
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });
    });

    describe('/pwa/admin/packs (GET)', () => {
      it('should get all packs including unpublished for admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/pwa/admin/packs')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toBeInstanceOf(Array);

        // Should include both published and unpublished packs
        const hasUnpublished = response.body.data.some((pack: any) => !pack.isPublished);
        expect(hasUnpublished).toBe(true);
      });

      it('should require admin authentication', async () => {
        await request(app.getHttpServer())
          .get('/pwa/admin/packs')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        await request(app.getHttpServer())
          .get('/pwa/admin/packs')
          .expect(401);
      });
    });

    describe('/pwa/admin/generate-samples (POST)', () => {
      it('should generate sample packs as admin', async () => {
        const response = await request(app.getHttpServer())
          .post('/pwa/admin/generate-samples')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(201);

        expect(response.body).toHaveProperty('success', true);
        expect(response.body.data).toHaveProperty('created');
        expect(response.body.data.created).toBeGreaterThan(0);
      });

      it('should require admin authentication', async () => {
        await request(app.getHttpServer())
          .post('/pwa/admin/generate-samples')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);

        await request(app.getHttpServer())
          .post('/pwa/admin/generate-samples')
          .expect(401);
      });
    });
  });

  describe('Asset validation', () => {
    it('should validate asset URLs', async () => {
      const invalidAssets = [
        {
          url: 'not-a-url',
          hash: 'abc123',
          bytes: 1024,
          kind: 'audio'
        },
        {
          url: 'file:///etc/passwd',
          hash: 'def456',
          bytes: 1024,
          kind: 'image'
        }
      ];

      for (const asset of invalidAssets) {
        await request(app.getHttpServer())
          .post('/pwa/admin/packs')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            code: 'invalid-url-test',
            title: 'Invalid URL Test',
            assets: [asset]
          })
          .expect(400);
      }
    });

    it('should validate asset sizes', async () => {
      const oversizedAsset = {
        url: 'https://example.com/huge-file.mp4',
        hash: 'huge123',
        bytes: 1024 * 1024 * 1024 * 2, // 2GB
        kind: 'other'
      };

      await request(app.getHttpServer())
        .post('/pwa/admin/packs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'oversized-test',
          title: 'Oversized Test',
          assets: [oversizedAsset]
        })
        .expect(400);
    });

    it('should validate asset kinds', async () => {
      const invalidKindAsset = {
        url: 'https://example.com/file.exe',
        hash: 'exe123',
        bytes: 1024,
        kind: 'executable' // Invalid kind
      };

      await request(app.getHttpServer())
        .post('/pwa/admin/packs')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: 'invalid-kind-test',
          title: 'Invalid Kind Test',
          assets: [invalidKindAsset]
        })
        .expect(400);
    });
  });
});
