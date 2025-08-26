import { chromium } from "playwright";
import type { Page, Browser, BrowserContext } from "playwright";

export class BrowserManager {
    private static instance: BrowserManager;
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;
    private page: Page | null = null;

    private constructor() {}

    public static getInstance(): BrowserManager {
        if (!BrowserManager.instance) {
            BrowserManager.instance = new BrowserManager();
        }
        return BrowserManager.instance;
    }

    public async launchBrowser(): Promise<void> {
        if (!this.browser) {
            this.browser = await chromium.launch({ headless: false });
            this.context = await this.browser.newContext();
            this.page = await this.context.newPage();
        }
    }

    public getPage(): Page {
        if (!this.page) {
            throw new Error("Browser not launched! Call launchBrowser() first.");
        }
        return this.page;
    }

    public async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.context = null;
            this.page = null;
        }
    }

    public isLaunched(): boolean {
        return this.browser !== null && this.page !== null;
    }
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms));