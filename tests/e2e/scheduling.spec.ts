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

test.describe('Scheduling Widget i18n', () => {
  test('should display French text when French is selected', async ({ page }) => {
    // Go to the contact page
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');
    
    // Ensure French is selected (should be default)
    const languageToggle = page.locator('[data-testid="language-toggle"], button:has-text("FR"), button:has-text("English")');
    if (await languageToggle.count() > 0) {
      const currentLang = await languageToggle.textContent();
      if (currentLang?.includes('EN') || currentLang?.includes('English')) {
        await languageToggle.click();
      }
    }
    
    // Click the scheduling button
    const scheduleButton = page.locator('text=Planifier').or(page.locator('button:has-text("Planifier")'));
    await expect(scheduleButton).toBeVisible();
    await scheduleButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('h2, [role="dialog"] h2, .modal h2', { timeout: 10000 });
    
    // Check for French text in the modal
    const modalTitle = page.locator('h2:has-text("Sélectionner le type"), h2:has-text("Type de réunion"), text="Sélectionner le type de réunion"');
    
    // Give some time for translations to load
    await page.waitForTimeout(1000);
    
    // Should find French text
    const hasFrenchTitle = await modalTitle.count() > 0;
    if (!hasFrenchTitle) {
      // Log what we found instead
      const allHeadings = await page.locator('h1, h2, h3').all();
      for (const heading of allHeadings) {
        const text = await heading.textContent();
        console.log('Found heading:', text);
      }
    }
    
    expect(hasFrenchTitle).toBe(true);
  });

  test('should display English text when English is selected', async ({ page }) => {
    // Go to the contact page
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');
    
    // Switch to English
    const languageToggle = page.locator('[data-testid="language-toggle"], button:has-text("FR"), button:has-text("Français")');
    if (await languageToggle.count() > 0) {
      await languageToggle.click();
    }
    
    // Wait for language switch
    await page.waitForTimeout(1000);
    
    // Click the scheduling button (should now be in English)
    const scheduleButton = page.locator('text="Schedule"').or(page.locator('button:has-text("Schedule")'));
    await expect(scheduleButton).toBeVisible();
    await scheduleButton.click();
    
    // Wait for modal
    await page.waitForSelector('h2, [role="dialog"] h2', { timeout: 10000 });
    
    // Check for English text
    const modalTitle = page.locator('h2:has-text("Select Meeting Type")');
    await expect(modalTitle).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Scheduling Widget UX', () => {
  test('should not scroll to top when opening modal', async ({ page }) => {
    // Go to contact page and scroll down
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');
    
    // Scroll down so we can detect if it scrolls back up
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Wait a moment for scroll to settle
    await page.waitForTimeout(500);
    
    // Get initial scroll position
    const initialScrollY = await page.evaluate(() => window.scrollY);
    expect(initialScrollY).toBeGreaterThan(400); // Ensure we're scrolled down
    
    // Click scheduling button
    const scheduleButton = page.locator('text=Planifier').or(page.locator('button:has-text("Planifier")'));
    await scheduleButton.click();
    
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"], .modal', { timeout: 10000 });
    
    // Check scroll position hasn't changed significantly
    const finalScrollY = await page.evaluate(() => window.scrollY);
    
    // Should not have scrolled to top (allowing some small variation)
    expect(finalScrollY).toBeGreaterThan(300);
  });

  test('should close modal when clicking outside', async ({ page }) => {
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');
    
    // Open modal
    const scheduleButton = page.locator('text=Planifier').or(page.locator('button:has-text("Planifier")'));
    await scheduleButton.click();
    
    // Wait for modal
    const modal = page.locator('[role="dialog"], .modal').first();
    await expect(modal).toBeVisible();
    
    // Click on backdrop (outside modal content)
    await page.locator('.bg-gray-500').click();
    
    // Modal should close
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });
});