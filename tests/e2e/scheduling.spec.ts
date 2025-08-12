import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

test.describe('Scheduling API', () => {
  test('should return JSON content-type for event-types endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/scheduling/event-types`);
    
    // Check that the response is successful
    expect(response.status()).toBe(200);
    
    // Check that content-type is application/json
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    // Verify we can parse the JSON response
    const data = await response.json();
    expect(data).toHaveProperty('eventTypes');
    expect(Array.isArray(data.eventTypes)).toBe(true);
  });

  test('should return JSON content-type for health endpoint', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/scheduling/health`);
    
    expect(response.status()).toBe(200);
    
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/json');
    
    const data = await response.json();
    expect(data).toHaveProperty('ok', true);
    expect(data).toHaveProperty('ts');
    expect(typeof data.ts).toBe('number');
  });
});

test.describe('Scheduling Widget', () => {
  test('should open scheduling widget and load event types', async ({ page }) => {
    // Go to the contact page
    await page.goto('/#contact');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click the "Planifier" button
    const planifierButton = page.locator('text=Planifier');
    await expect(planifierButton).toBeVisible();
    await planifierButton.click();
    
    // Wait for the scheduling widget modal to appear
    await page.waitForSelector('[role="dialog"], .modal, [class*="modal"]', { timeout: 10000 });
    
    // Check if the modal shows event types or a clear error message
    const modalContent = page.locator('[role="dialog"], .modal, [class*="modal"]').first();
    await expect(modalContent).toBeVisible();
    
    // The widget should either:
    // 1. Show event types successfully, or
    // 2. Show a clear French error message about the service being unavailable
    
    // Try to detect if event types loaded successfully
    const hasEventTypes = await page.locator('text=/Type de rendez-vous|Event Type|Consultation/').count() > 0;
    
    // Try to detect if there's a French error message
    const hasErrorMessage = await page.locator('text=/indisponible|erreur|connexion/i').count() > 0;
    
    // At least one should be true - either success or proper error handling
    expect(hasEventTypes || hasErrorMessage).toBe(true);
    
    // If there's an error, it should be user-friendly in French
    if (hasErrorMessage) {
      const errorText = await page.locator('text=/indisponible|erreur|connexion/i').first().textContent();
      console.log('Scheduling widget error message:', errorText);
      
      // Should not contain raw technical errors
      expect(errorText).not.toContain('Unexpected token');
      expect(errorText).not.toContain('Failed to fetch');
      expect(errorText).not.toContain('HTTP 500');
    }
  });

  test('should handle backend unavailable gracefully', async ({ page, context }) => {
    // Block all API requests to simulate backend down
    await context.route(`${API_BASE_URL}/scheduling/**`, route => {
      route.abort('connectionrefused');
    });
    
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');
    
    const planifierButton = page.locator('text=Planifier');
    await expect(planifierButton).toBeVisible();
    await planifierButton.click();
    
    // Wait for the modal and error handling
    await page.waitForTimeout(3000);
    
    // Should show a French error message
    const errorMessage = await page.locator('text=/connexion|indisponible|erreur/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    const errorText = await errorMessage.textContent();
    console.log('Backend unavailable error:', errorText);
    
    // Should be in French and user-friendly
    expect(errorText?.toLowerCase()).toMatch(/connexion|indisponible|erreur/);
  });
});