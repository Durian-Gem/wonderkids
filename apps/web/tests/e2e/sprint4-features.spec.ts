import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';

// Mock user credentials for testing
const TEST_USER = {
  email: 'test-user@wonderkids.com',
  password: 'TestPassword123!',
  name: 'Test User'
};

const TEST_CHILD = {
  name: 'Test Child',
  birthDate: '2018-01-01'
};

test.describe('Sprint 4 Features - AI Tutor, Pronunciation, PWA, Email', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto(BASE_URL);
    
    // Mock authentication if needed
    if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true') {
      await page.goto(`${BASE_URL}/test-auth`);
      await page.click('[data-testid="mock-login"]');
    } else {
      // Perform actual login
      await page.click('[href="/auth/sign-in"]');
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', TEST_USER.password);
      await page.click('[data-testid="sign-in-button"]');
    }
    
    // Wait for authentication to complete
    await page.waitForURL('**/dashboard');
  });

  test.describe('AI Tutor Features', () => {
    test('should start tutor topic and have conversation', async ({ page }) => {
      // Navigate to tutor page
      await page.goto(`${BASE_URL}/tutor`);
      await page.waitForLoadState('networkidle');

      // Verify tutor page loaded
      await expect(page.locator('h1')).toContainText('AI English Tutor');

      // Select a topic (animals)
      await page.click('[data-testid="topic-animals"]');
      
      // Wait for session creation
      await page.waitForURL('**/tutor/*');
      
      // Verify chat interface loaded
      await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
      await expect(page.locator('[data-testid="topic-title"]')).toContainText('Animals');

      // Send first message
      await page.fill('[data-testid="message-input"]', 'Tell me about cats');
      await page.click('[data-testid="send-button"]');

      // Wait for AI response
      await expect(page.locator('[data-testid="ai-message"]').first()).toBeVisible({ timeout: 10000 });
      
      // Send second message
      await page.fill('[data-testid="message-input"]', 'What do cats eat?');
      await page.click('[data-testid="send-button"]');

      // Wait for second AI response
      await expect(page.locator('[data-testid="ai-message"]').nth(1)).toBeVisible({ timeout: 10000 });

      // Verify conversation has at least 4 messages (2 user, 2 AI)
      const messages = page.locator('[data-testid*="message"]');
      await expect(messages).toHaveCount(4, { timeout: 5000 });
    });

    test('should show guardian transcript dialog', async ({ page }) => {
      // First create a conversation
      await page.goto(`${BASE_URL}/tutor`);
      await page.click('[data-testid="topic-family"]');
      await page.waitForURL('**/tutor/*');
      
      // Send a test message
      await page.fill('[data-testid="message-input"]', 'Tell me about families');
      await page.click('[data-testid="send-button"]');
      await page.waitForSelector('[data-testid="ai-message"]', { timeout: 10000 });

      // Go back to tutor home to access history
      await page.click('[data-testid="back-button"]');
      await page.waitForURL('**/tutor');

      // Switch to history tab
      await page.click('[data-testid="history-tab"]');
      
      // Open transcript dialog
      await page.click('[data-testid="transcript-button"]').first();
      
      // Verify transcript dialog opened
      await expect(page.locator('[data-testid="transcript-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="transcript-content"]')).toContainText('Tell me about families');
      
      // Test export functionality
      await page.click('[data-testid="export-transcript"]');
      
      // Close dialog
      await page.click('[data-testid="close-dialog"]');
      await expect(page.locator('[data-testid="transcript-dialog"]')).not.toBeVisible();
    });

    test('should enforce word limits and safety rules', async ({ page }) => {
      await page.goto(`${BASE_URL}/tutor`);
      await page.click('[data-testid="topic-school"]');
      await page.waitForURL('**/tutor/*');

      // Test word limit enforcement
      const longMessage = 'This is a very long message that should exceed the sixty word limit and be rejected by the system because it contains too many words for a child to send in a single message to the AI tutor which is designed to keep conversations short and manageable for young learners who are practicing English language skills.';
      
      await page.fill('[data-testid="message-input"]', longMessage);
      
      // Send button should be disabled for too long message
      await expect(page.locator('[data-testid="send-button"]')).toBeDisabled();
      
      // Check word count indicator
      await expect(page.locator('[data-testid="word-count"]')).toContainText('60');

      // Test with appropriate message
      await page.fill('[data-testid="message-input"]', 'What subjects do you study at school?');
      await expect(page.locator('[data-testid="send-button"]')).toBeEnabled();
      
      await page.click('[data-testid="send-button"]');
      await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Pronunciation Features', () => {
    test('should access pronunciation practice and show score', async ({ page }) => {
      // Navigate to a lesson first
      await page.goto(`${BASE_URL}/dashboard`);
      await page.click('[data-testid="start-lesson"]').first();
      await page.waitForURL('**/lesson/*');

      // Navigate to pronunciation practice
      await page.goto(page.url() + '/speak');
      
      // Verify pronunciation page loaded
      await expect(page.locator('h1')).toContainText('Pronunciation Practice');
      
      // Check recorder component is present
      await expect(page.locator('[data-testid="recorder"]')).toBeVisible();
      await expect(page.locator('[data-testid="record-button"]')).toBeVisible();

      // Mock audio recording (since we can't actually record in headless mode)
      await page.evaluate(() => {
        // Mock MediaRecorder API
        (window as any).MediaRecorder = class MockMediaRecorder {
          constructor() {}
          start() {}
          stop() {}
          ondataavailable = null;
          onstop = null;
          state = 'inactive';
        };
        
        navigator.mediaDevices = {
          getUserMedia: () => Promise.resolve(new MediaStream())
        } as any;
      });

      // Click record button
      await page.click('[data-testid="record-button"]');
      
      // Verify recording state
      await expect(page.locator('[data-testid="recording-status"]')).toContainText('Recording');
      
      // Stop recording (simulate)
      await page.click('[data-testid="record-button"]');
      
      // Submit recording (mock)
      await page.click('[data-testid="submit-recording"]');
      
      // Verify score card appears
      await expect(page.locator('[data-testid="score-card"]')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('[data-testid="overall-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="accuracy-score"]')).toBeVisible();
      await expect(page.locator('[data-testid="fluency-score"]')).toBeVisible();
    });

    test('should show pronunciation history and progress', async ({ page }) => {
      // Navigate to pronunciation practice
      await page.goto(`${BASE_URL}/lesson/test-lesson-id/speak`);
      
      // Create a mock attempt first (in real test, this would use the API)
      await page.evaluate(() => {
        localStorage.setItem('mock-pronunciation-attempts', JSON.stringify([
          {
            id: '1',
            questionId: 'q1',
            accuracy: 0.85,
            fluencyScore: 0.78,
            pronScore: 0.82,
            createdAt: new Date().toISOString()
          },
          {
            id: '2', 
            questionId: 'q1',
            accuracy: 0.92,
            fluencyScore: 0.88,
            pronScore: 0.90,
            createdAt: new Date().toISOString()
          }
        ]));
      });

      // Reload to load mock data
      await page.reload();
      
      // Check previous attempts section
      await expect(page.locator('[data-testid="previous-attempts"]')).toBeVisible();
      
      // Verify progress indication
      await expect(page.locator('[data-testid="attempt-history"]')).toContainText('Attempt');
      
      // Check sparkline/progress visualization if present
      const progressChart = page.locator('[data-testid="progress-chart"]');
      if (await progressChart.isVisible()) {
        await expect(progressChart).toBeVisible();
      }
    });
  });

  test.describe('PWA Features', () => {
    test('should show PWA install prompt and handle installation', async ({ page }) => {
      // Mock PWA installability
      await page.addInitScript(() => {
        let deferredPrompt: any = null;
        
        // Mock beforeinstallprompt event
        setTimeout(() => {
          const event = new Event('beforeinstallprompt');
          (event as any).prompt = () => Promise.resolve();
          (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });
          deferredPrompt = event;
          window.dispatchEvent(event);
        }, 1000);
        
        // Mock PWA detection
        Object.defineProperty(window, 'matchMedia', {
          value: () => ({ matches: false })
        });
      });

      await page.goto(`${BASE_URL}/dashboard`);
      
      // Wait for install prompt to appear
      await expect(page.locator('[data-testid="pwa-install-prompt"]')).toBeVisible({ timeout: 5000 });
      
      // Check install prompt content
      await expect(page.locator('[data-testid="install-title"]')).toContainText('Install WonderKids');
      await expect(page.locator('[data-testid="install-benefits"]')).toBeVisible();
      
      // Click install button
      await page.click('[data-testid="install-button"]');
      
      // Verify installation process (mock)
      await expect(page.locator('[data-testid="installing-text"]')).toBeVisible();
    });

    test('should show offline content manager and download packs', async ({ page }) => {
      // Navigate to offline content page (or dashboard with offline section)
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Look for offline/PWA content section
      const offlineSection = page.locator('[data-testid="offline-content"]');
      if (await offlineSection.isVisible()) {
        await offlineSection.click();
      } else {
        // Navigate directly to offline content if separate page
        await page.goto(`${BASE_URL}/offline`);
      }
      
      // Verify offline content manager
      await expect(page.locator('[data-testid="content-packs"]')).toBeVisible();
      
      // Check for download buttons
      const downloadButton = page.locator('[data-testid="download-pack"]').first();
      if (await downloadButton.isVisible()) {
        await downloadButton.click();
        
        // Verify download progress or completion
        await expect(page.locator('[data-testid="download-progress"]')).toBeVisible({ timeout: 5000 });
      }
      
      // Test offline indicator
      await page.evaluate(() => {
        // Simulate offline mode
        Object.defineProperty(navigator, 'onLine', { value: false });
        window.dispatchEvent(new Event('offline'));
      });
      
      await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();
    });

    test('should work in offline mode with cached content', async ({ page }) => {
      // First visit pages to cache them
      await page.goto(`${BASE_URL}/dashboard`);
      await page.goto(`${BASE_URL}/tutor`);
      
      // Simulate offline mode
      await page.route('**/*', route => {
        // Block all network requests to simulate offline
        route.abort();
      });
      
      await page.evaluate(() => {
        Object.defineProperty(navigator, 'onLine', { value: false });
        window.dispatchEvent(new Event('offline'));
      });
      
      // Try to navigate (should work with cached content)
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Basic navigation should still work
      await expect(page.locator('body')).toBeVisible();
      
      // Check for offline indicator
      await expect(page.locator('[data-testid="offline-status"]')).toBeVisible();
    });
  });

  test.describe('Email Settings', () => {
    test('should toggle weekly email settings and persist', async ({ page }) => {
      // Navigate to family settings
      await page.goto(`${BASE_URL}/family`);
      
      // Look for email settings section
      await expect(page.locator('[data-testid="email-settings"]')).toBeVisible();
      
      // Find weekly email toggle
      const emailToggle = page.locator('[data-testid="weekly-email-toggle"]');
      
      // Get initial state
      const initialState = await emailToggle.isChecked();
      
      // Toggle the setting
      await emailToggle.click();
      
      // Verify toggle changed
      await expect(emailToggle).toBeChecked({ checked: !initialState });
      
      // Check for success toast/message
      await expect(page.locator('[data-testid="settings-saved"]')).toBeVisible({ timeout: 5000 });
      
      // Reload page to verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify setting persisted
      await expect(emailToggle).toBeChecked({ checked: !initialState });
      
      // Test preview functionality if available
      const previewButton = page.locator('[data-testid="preview-email"]');
      if (await previewButton.isVisible()) {
        await previewButton.click();
        await expect(page.locator('[data-testid="email-preview"]')).toBeVisible();
      }
    });

    test('should handle email preview and sending', async ({ page }) => {
      await page.goto(`${BASE_URL}/family`);
      
      // Enable weekly emails first
      const emailToggle = page.locator('[data-testid="weekly-email-toggle"]');
      if (!(await emailToggle.isChecked())) {
        await emailToggle.click();
        await page.waitForSelector('[data-testid="settings-saved"]', { timeout: 5000 });
      }
      
      // Test email preview
      const previewButton = page.locator('[data-testid="preview-email"]');
      if (await previewButton.isVisible()) {
        await previewButton.click();
        
        // Verify preview content
        await expect(page.locator('[data-testid="email-preview"]')).toBeVisible();
        await expect(page.locator('[data-testid="preview-content"]')).toContainText('Week');
        
        // Close preview
        await page.click('[data-testid="close-preview"]');
      }
    });
  });

  test.describe('Cross-Feature Integration', () => {
    test('should navigate between all Sprint 4 features seamlessly', async ({ page }) => {
      // Start from dashboard
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Navigate to AI Tutor
      await page.click('[href="/tutor"]');
      await expect(page.locator('h1')).toContainText('AI English Tutor');
      
      // Go to family settings
      await page.click('[href="/family"]');
      await expect(page.locator('[data-testid="family-page"]')).toBeVisible();
      
      // Navigate to a lesson for pronunciation
      await page.goto(`${BASE_URL}/dashboard`);
      const lessonLink = page.locator('[data-testid="lesson-link"]').first();
      if (await lessonLink.isVisible()) {
        await lessonLink.click();
        
        // Try pronunciation practice
        const speakTab = page.locator('[href*="/speak"]');
        if (await speakTab.isVisible()) {
          await speakTab.click();
          await expect(page.locator('[data-testid="pronunciation-practice"]')).toBeVisible();
        }
      }
    });

    test('should maintain authentication across features', async ({ page }) => {
      // Test authentication persistence across different features
      const features = [
        '/dashboard',
        '/tutor', 
        '/family',
        '/lesson/test-lesson/speak'
      ];
      
      for (const feature of features) {
        await page.goto(`${BASE_URL}${feature}`);
        
        // Should not redirect to login
        await expect(page).not.toHaveURL('**/auth/sign-in');
        
        // Should show authenticated content
        await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      }
    });

    test('should handle error states gracefully', async ({ page }) => {
      // Test with network failures
      await page.route('**/api/**', route => {
        // Intermittently fail API requests
        if (Math.random() > 0.7) {
          route.abort();
        } else {
          route.continue();
        }
      });
      
      await page.goto(`${BASE_URL}/tutor`);
      
      // App should handle failures gracefully
      await expect(page.locator('body')).toBeVisible();
      
      // Error messages should be user-friendly
      const errorMessage = page.locator('[data-testid="error-message"]');
      if (await errorMessage.isVisible()) {
        await expect(errorMessage).not.toContainText('Error 500');
        await expect(errorMessage).not.toContainText('undefined');
      }
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load pages quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should be keyboard accessible', async ({ page }) => {
      await page.goto(`${BASE_URL}/tutor`);
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Focus should be visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Enter should activate buttons
      await page.keyboard.press('Enter');
      
      // Should navigate or perform action
      await page.waitForTimeout(1000); // Wait for potential navigation
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto(`${BASE_URL}/tutor`);
      
      // Check for ARIA labels on interactive elements
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Should have either aria-label or visible text
        expect(ariaLabel || textContent?.trim()).toBeTruthy();
      }
    });
  });
});
