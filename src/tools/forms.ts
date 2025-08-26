import { tool } from '@openai/agents';
import { z } from 'zod';
import { BrowserManager } from '../utils/BrowserManager';
import type { FormField } from '../types';

export const fillInput = tool({
    name: 'fillInput',
    description: 'fills an input field with specified text',
    parameters: z.object({ 
        selector: z.string(),
        text: z.string()
    }),
    async execute({ selector, text }) {
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();
        console.log("Filling input", selector, text);
        
        try {
            await page.fill(selector, text);
            return `Filled input with selector "${selector}" with: ${text}`;
        } catch (error: any) {
            return `Failed to fill input: ${error.message}`;
        }
    },
});

export const fillInputs = tool({
    name: 'fillInputs',
    description: 'Fills multiple input fields with specified text values',
    parameters: z.object({
        fields: z.array(
            z.object({
                selector: z.string(),
                text: z.string()
            })
        )
    }),
    async execute({ fields }) {
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();

        const results: string[] = [];

        for (const { selector, text } of fields) {
            try {
                console.log("Filling input", selector, text);
                await page.fill(selector, text);
                results.push(`✅ Filled "${selector}" with "${text}"`);
            } catch (error: any) {
                results.push(`❌ Failed to fill "${selector}": ${error.message}`);
            }
        }

        return results;
    },
});

export const fillInputsByPlaceholder = tool({
    name: 'fillInputsByPlaceholder',
    description: 'Fills multiple input fields by their placeholder text',
    parameters: z.object({
        fields: z.array(
            z.object({
                placeholder: z.string(),
                text: z.string()
            })
        )
    }),
    async execute({ fields }) {
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();

        const results: string[] = [];

        for (const { placeholder, text } of fields) {
            try {
                console.log("Filling input with placeholder", placeholder, text);
                await page.getByPlaceholder(placeholder).fill(text);
                results.push(`✅ Filled input with placeholder "${placeholder}" with "${text}"`);
            } catch (error: any) {
                results.push(`❌ Failed to fill placeholder "${placeholder}": ${error.message}`);
            }
        }

        return results;
    },
});