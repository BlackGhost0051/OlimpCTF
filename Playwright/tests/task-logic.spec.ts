import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';

test.describe('Task Logic - E2E Tests', () => {
    let authHelper: AuthHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        await authHelper.login();

        await page.waitForTimeout(100);
        await page.goto('/categories');
        await page.waitForLoadState('networkidle');
      });

    test.afterEach(async ({ page }) => {
        await page.keyboard.press('Escape');
    });

    test('Should display task details when task is clicked', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");

        // When
        const firstTask = page.locator('.task-container').first();
        await firstTask.waitFor({ state: 'visible', timeout: 10000 });
        await firstTask.click();

        // Then
        await expect(page.locator('[data-cy="task-view-container"]')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('[data-cy="task-title"]')).toBeVisible();
        await expect(page.locator('[data-cy="task-description"]')).toBeVisible();
        await expect(page.locator('[data-cy="task-points"]')).toBeVisible();
        await expect(page.locator('[data-cy="task-category"]')).toBeVisible();
    });

    test('Should display task metadata correctly', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");

        // When
        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        // Then
        const points = await page.locator('[data-cy="task-points"]').textContent();
        const difficulty = await page.locator('[data-cy="task-difficulty"]').textContent();
        const category = await page.locator('[data-cy="task-category"]').textContent();

        expect(points).toBeTruthy();
        expect(difficulty).toBeTruthy();
        expect(category).toBeTruthy();
    });

    test('Should allow flag submission with input', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");

        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        // When
        const flagInput = page.locator('[data-cy="flag-input"]');
        await flagInput.waitFor({ state: 'visible' });
        await flagInput.fill('CTF{test_flag_e2e}');

        // Then
        const submitButton = page.locator('[data-cy="submit-flag-btn"]');
        await expect(submitButton).toBeEnabled();
    });

    test('Should disable submit button when flag input is empty', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");

        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        // When
        const flagInput = page.locator('[data-cy="flag-input"]');
        await flagInput.clear();

        // Then
        const submitButton = page.locator('[data-cy="submit-flag-btn"]');
        await expect(submitButton).toBeDisabled();
    });

    test('Should handle flag submission', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");

        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        // When
        const flagInput = page.locator('[data-cy="flag-input"]');
        await flagInput.fill(process.env.TEST_FLAG || 'CTF{test_flag}');

        page.once('dialog', async dialog => {
            expect(dialog.message()).toBeTruthy();
            await dialog.accept();
        });

        const submitButton = page.locator('[data-cy="submit-flag-btn"]');
        await submitButton.click();

        // Then
        await page.waitForTimeout(1000);
    });

    test('Should show container controls for tasks with container support', async ({ page }) => {
        // Given
        await page.goto('/categories');

        // When
        const webCategory = page.locator('.category-container').first();
        if (await webCategory.isVisible()) {
            await webCategory.click();
            await page.waitForTimeout(1000);
        }

        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        // Then
        const containerSection = page.locator('[data-cy="container-section"]');
        if (await containerSection.isVisible()) {
            await expect(page.locator('[data-cy="start-container-btn"]')).toBeVisible();
        } else {
            console.log('This task does not support containers');
        }
    });

    test('Should start container when button is clicked', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");

        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        const containerSection = page.locator('[data-cy="container-section"]');

        if (await containerSection.isVisible()) {

        if(await page.locator('[data-cy="stop-container-btn"]').isVisible()){
            await page.locator('[data-cy="stop-container-btn"]').click();
        }

        const startButton = page.locator('[data-cy="start-container-btn"]');

        let dialogAppeared = false;
        page.once('dialog', async dialog => {
            dialogAppeared = true;
            await dialog.accept();
        });

        // When
        await startButton.click();

        // Then
        await page.waitForTimeout(2000);

        const containerInfo = page.locator('[data-cy="container-info"]');
        const buttonText = await startButton.textContent();

        expect(buttonText?.includes('Starting') ||
            buttonText?.includes('Running') ||
            await containerInfo.isVisible() ||
            dialogAppeared).toBeTruthy();

        if (await page.locator('[data-cy="stop-container-btn"]').isVisible()) {
            await page.locator('[data-cy="stop-container-btn"]').click();
        }
        } else {
        test.skip();
        }
    });

    test('Should display container URL when container is running', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");

        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        const containerSection = page.locator('[data-cy="container-section"]');

        if (await containerSection.isVisible()) {
            if(await page.locator('[data-cy="stop-container-btn"]').isVisible()){
                await await page.locator('[data-cy="stop-container-btn"]').click();
            }
            const startButton = page.locator('[data-cy="start-container-btn"]');
            await startButton.click();
            await page.waitForTimeout(3000);

            // When
            const containerInfo = page.locator('[data-cy="container-info"]');

        if (await containerInfo.isVisible()) {
            // Then
            await expect(page.locator('[data-cy="container-url"]')).toBeVisible();
            await expect(page.locator('[data-cy="stop-container-btn"]')).toBeVisible();
        }
        } else {
            test.skip();
        }
    });

    test('Should stop container when stop button is clicked', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");

        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        const containerSection = page.locator('[data-cy="container-section"]');

        if (await containerSection.isVisible()) {
            if(await page.locator('[data-cy="stop-container-btn"]').isVisible()){
                await await page.locator('[data-cy="stop-container-btn"]').click();
            }
            await page.locator('[data-cy="start-container-btn"]').click();
            await page.waitForTimeout(3000);

            const stopButton = page.locator('[data-cy="stop-container-btn"]');

            if (await stopButton.isVisible()) {
                page.once('dialog', async dialog => {
                    await dialog.accept();
                });

                // When
                await stopButton.click();
                await page.waitForTimeout(2000);

                // Then
                await expect(stopButton).not.toBeVisible({ timeout: 10000 });
                await expect(page.locator('[data-cy="start-container-btn"]')).toBeVisible({ timeout: 10000 });
            }
        } else {
            test.skip();
        }
    });

    test('Should show file download buttons when files exist', async ({ page }) => {
        // Given
        await authHelper.goToCategory("Crypto");
        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        // When
        const filesSection = page.locator('[data-cy="files-section"]');

        if (await filesSection.isVisible()) {
            // Then
            const fileItems = page.locator('[data-cy^="file-item-"]');
            await expect(fileItems.first()).toBeVisible();

            const downloadButton = page.locator('[data-cy^="download-file-"]').first();
            await expect(downloadButton).toBeVisible();
        } else {
         console.log('This task does not have downloadable files');
        }
    });

    test('Should close task view when close button is clicked', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");
        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        // When
        const closeButton = page.locator('[data-cy="task-close-btn"]');
        await closeButton.click();

        // Then
        await expect(page.locator('[data-cy="task-view-container"]')).not.toBeVisible();
    });

    test('Should close task view when clicking backdrop', async ({ page }) => {
        // Given
        await authHelper.goToCategory("WEB");
        const firstTask = page.locator('.task-container').first();
        await firstTask.click();
        await page.waitForSelector('[data-cy="task-view-container"]', { state: 'visible' });

        // When
        await page.locator('[data-cy="task-view-backdrop"]').click({ position: { x: 10, y: 10 } });

        // Then
        await expect(page.locator('[data-cy="task-view-container"]')).not.toBeVisible();
    });
});

test.describe('Task Logic - Authentication Required', () => {
    test('Should redirect to login when accessing tasks without authentication', async ({ page }) => {
        // Given
        await page.goto('/');

        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });

        // When
        await page.goto('/categories');

        // Then
        await page.waitForTimeout(2000);
        const url = page.url();

        expect(url.includes('/login') ||
            url.includes('/home') ||
            await page.locator('text=login, text=sign in').first().isVisible()).toBeTruthy();
    });
});
