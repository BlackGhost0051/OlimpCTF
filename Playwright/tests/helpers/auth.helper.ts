import { Page } from '@playwright/test';

export class AuthHelper {
    constructor(private page: Page) {}


    async login(username?: string, password?: string): Promise<void> {
        const login = username || process.env.TEST_USER_LOGIN || 'testuser';
        const pass = password || process.env.TEST_USER_PASSWORD || 'testpassword123';

        await this.page.goto('/login');

        await this.page.fill('input[name="login"], input[type="text"]', login);
        await this.page.fill('input[name="password"], input[type="password"]', pass);

        await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    }

    async goToCategory(categoryName: string){
      await this.page.goto('/categories');
        await this.page.locator('.category-name', { hasText: categoryName }).click();
    }
}
