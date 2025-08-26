import { tool } from '@openai/agents';
import { z } from 'zod';
import { BrowserManager } from '../utils/BrowserManager';

export const launchTheBrowser = tool({
    name: 'launchTheBrowser',
    description: 'this tool is used to launch the browser',
    parameters: z.object({}),
    async execute({}) {
        const browserManager = BrowserManager.getInstance();
        await browserManager.launchBrowser();
        return `Browser Launched`;
    },
});