import { tool } from '@openai/agents';
import { z } from 'zod';
import { BrowserManager, delay } from '../utils/BrowserManager';

export const analyzePage = tool({
    name: 'analyzePage',
    description: 'analyzes the current page content, links, buttons, and form elements',
    parameters: z.object({}),
    async execute({}) {
        const browserManager = BrowserManager.getInstance();
        const page = browserManager.getPage();
        
        await page.waitForLoadState('networkidle');
        await delay(2000); // Wait a bit for dynamic content to load
        
        // The function inside evaluate() runs in browser context where document is available
        const pageAnalysis = await page.evaluate(() => {
            // This code runs in the browser, so document and window are available
            const analysis = {
                title: (globalThis as any).document.title,
                url: (globalThis as any).window.location.href,
                buttons: [] as any[],
                links: [] as any[],
                inputs: [] as any[],
                clickableElements: [] as any[],
                text: (globalThis as any).document.body.innerText.substring(0, 2000)
            };

            // Get all buttons
            (globalThis as any).document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach((btn: any, index: number) => {
                analysis.buttons.push({
                    index,
                    text: btn.innerText || btn.value || 'No text',
                    type: btn.type || 'button',
                    id: btn.id || null,
                    className: btn.className || null,
                    selector: `button:nth-of-type(${index + 1})`
                });
            });

            // Get all links
            (globalThis as any).document.querySelectorAll('a[href]').forEach((link: any, index: number) => {
                analysis.links.push({
                    index,
                    text: link.innerText.trim() || 'No text',
                    href: link.href,
                    id: link.id || null,
                    selector: `a:nth-of-type(${index + 1})`
                });
            });

            // Get all input fields
            (globalThis as any).document.querySelectorAll('input, textarea, select').forEach((input: any, index: number) => {
                analysis.inputs.push({
                    index,
                    type: input.type || 'text',
                    placeholder: input.placeholder || null,
                    name: input.name || null,
                    id: input.id || null,
                    selector: `input:nth-of-type(${index + 1})`
                });
            });

            // Get other clickable elements
            (globalThis as any).document.querySelectorAll('[onclick], [role="button"], .btn, .button').forEach((el: any, index: number) => {
                if (!el.matches('button, input[type="button"], input[type="submit"], a')) {
                    analysis.clickableElements.push({
                        index,
                        text: el.innerText?.trim().substring(0, 50) || 'No text',
                        tagName: el.tagName.toLowerCase(),
                        className: el.className || null,
                        role: el.getAttribute('role') || null
                    });
                }
            });

            return analysis;
        });

        const response = `Page Analysis Complete:
Title: ${pageAnalysis.title}
URL: ${pageAnalysis.url}

BUTTONS FOUND (${pageAnalysis.buttons.length}):
${pageAnalysis.buttons.map((btn: any) => `- "${btn.text}" (${btn.type}) ${btn.id ? `[id: ${btn.id}]` : ''}`).join('\n')}

LINKS FOUND (${pageAnalysis.links.length}):
${pageAnalysis.links.slice(0, 10).map((link: any) => `- "${link.text}" -> ${link.href}`).join('\n')}
${pageAnalysis.links.length > 10 ? `... and ${pageAnalysis.links.length - 10} more links` : ''}

INPUT FIELDS (${pageAnalysis.inputs.length}):
${pageAnalysis.inputs.map((input: any) => `- type: ${input.type}, placeholder: "${input.placeholder || 'none'}", name: ${input.name || 'unnamed'}, id: ${input.id || 'none'}`).join('\n')}

CLICKABLE ELEMENTS (${pageAnalysis.clickableElements.length}):
${pageAnalysis.clickableElements.map((el: any) => `- ${el.tagName}: "${el.text}"`).join('\n')}

PAGE TEXT PREVIEW:
${pageAnalysis.text.substring(0, 500)}...`;
        
        console.log(response);
        return response;
    }
});