import { tool } from '@openai/agents';
import { z } from 'zod';
import { BrowserManager } from '../utils/BrowserManager';

export const gotoawebsite = tool({
    name: 'gotoawebsite',
    description: 'this tool is used to open a website',
    parameters: z.object({ webisteLink: z.string() }),
    async execute({ webisteLink }) {
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();
        await page.goto(webisteLink);
        return `Navigated to ${webisteLink}`;
    },
});

export const googleSearch = tool({
    name: 'googleSearch',
    description: 'this tool is used to search something on google',
    parameters: z.object({ textToSearch: z.string() }),
    async execute({ textToSearch }) {
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();
        await page.getByTitle('Search').fill(textToSearch);
        await page.keyboard.press('Enter');
        return `Google Search done for ${textToSearch}`;
    },
});