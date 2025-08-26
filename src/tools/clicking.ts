import { tool } from '@openai/agents';
import { z } from 'zod';
import { BrowserManager } from '../utils/BrowserManager';

export const clickElement = tool({
    name: 'clickElement',
    description: 'clicks on a specific element by selector or text. Provide either selector OR text, not both.',
    parameters: z.object({ 
        selector: z.string().nullable(),
        text: z.string().nullable(),
        elementType: z.enum(['button', 'link', 'input', 'any']).default('any')
    }),
    async execute({ selector, text, elementType }) {
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();
        
        try {
            if (selector) {
                await page.click(selector);
                return `Clicked on element with selector: ${selector}`;
            } else if (text) {
                const elementSelectors = {
                    button: 'button, input[type="button"], input[type="submit"]',
                    link: 'a',
                    input: 'input, textarea, select',
                    any: '*'
                };
                
                const found = await page.locator(elementSelectors[elementType])
                    .filter({ hasText: text }).first();
                
                await found.click();
                return `Clicked on ${elementType} with text: "${text}"`;
            } else {
                throw new Error("Either selector or text must be provided");
            }
        } catch (error: any) {
            return `Failed to click: ${error.message}`;
        }
    },
});

export const clickBySelector = tool({
    name: 'clickBySelector',
    description: 'clicks on an element using CSS selector',
    parameters: z.object({ 
        selector: z.string()
    }),
    async execute({ selector }) {
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();
        
        try {
            await page.click(selector);
            return `Clicked on element with selector: ${selector}`;
        } catch (error: any) {
            return `Failed to click: ${error.message}`;
        }
    },
});

export const clickByText = tool({
    name: 'clickByText',
    description: 'clicks on an element by searching for text content',
    parameters: z.object({ 
        text: z.string(),
        elementType: z.enum(['button', 'link', 'input', 'any']).default('any')
    }),
    async execute({ text, elementType }) {
        console.log("Clicking by text", text, elementType);
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();
        
        try {
            const elementSelectors = {
                button: 'button, input[type="button"], input[type="submit"]',
                link: 'a',
                input: 'input, textarea, select',
                any: '*'
            };
            
            const found = await page.locator(elementSelectors[elementType])
                .filter({ hasText: text }).first();
            
            await found.click();
            return `Clicked on ${elementType} with text: "${text}"`;
        } catch (error: any) {
            return `Failed to click: ${error.message}`;
        }
    },
});