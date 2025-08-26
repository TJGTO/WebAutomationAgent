// import { chromium } from "playwright";
// import type { Page } from "playwright";
// import { Agent, tool } from '@openai/agents';
// import type { AgentInputItem } from '@openai/agents'
// import { z } from 'zod';
// import dotenv from 'dotenv'
// import { run } from '@openai/agents';

// let browser: any;
// let page: Page;

// dotenv.config()

// const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// const gotoawebsite = tool({
//     name: 'gotoawebsite',
//     description: 'this tool is used to open a website',
//     parameters: z.object({ webisteLink: z.string() }),
//     async execute({ webisteLink }) {
//         if (!page) throw new Error("Browser not opened!");
//         await page.goto(webisteLink);
//         return `Navigated to ${webisteLink}`;
//     },
// });

// const launchTheBrowser = tool({
//     name: 'launchTheBrowser',
//     description: 'this tool is used to launch the browser',
//     parameters: z.object({}),
//     async execute({ }) {
//         browser = await chromium.launch({ headless: false });
//         const context = await browser.newContext();
//         page = await context.newPage();
//         return `Browser Launched`;
//     },
// });

// const googleSearch = tool({
//     name: 'googleSearch',
//     description: 'this tool is used to search something on google',
//     parameters: z.object({ textToSearch: z.string() }),
//     async execute({ textToSearch }) {
//         if (!page) throw new Error("Browser not opened!");
//         await page.getByTitle('Search').fill(textToSearch);
//         await page.keyboard.press('Enter');
//         return `Google Search done for ${textToSearch}`;
//     },
// });

// // FIXED: Replace .optional() with .nullable().optional() or use union types
// const clickElement = tool({
//     name: 'clickElement',
//     description: 'clicks on a specific element by selector or text. Provide either selector OR text, not both.',
//     parameters: z.object({ 
//         selector: z.string().nullable(),
//         text: z.string().nullable(),
//         elementType: z.enum(['button', 'link', 'input', 'any']).default('any')
//     }),
//     async execute({ selector, text, elementType }) {
//         if (!page) throw new Error("Browser not opened!");
        
//         try {
//             if (selector) {
//                 await page.click(selector);
//                 return `Clicked on element with selector: ${selector}`;
//             } else if (text) {
//                 // Try to find element by text
//                 const elementSelectors = {
//                     button: 'button, input[type="button"], input[type="submit"]',
//                     link: 'a',
//                     input: 'input, textarea, select',
//                     any: '*'
//                 };
                
//                 const found = await page.locator(elementSelectors[elementType])
//                     .filter({ hasText: text }).first();
                
//                 await found.click();
//                 return `Clicked on ${elementType} with text: "${text}"`;
//             } else {
//                 throw new Error("Either selector or text must be provided");
//             }
//         } catch (error: any) {
//             return `Failed to click: ${error.message}`;
//         }
//     },
// });

// // Alternative approach - using separate tools for different click methods
// const clickBySelector = tool({
//     name: 'clickBySelector',
//     description: 'clicks on an element using CSS selector',
//     parameters: z.object({ 
//         selector: z.string()
//     }),
//     async execute({ selector }) {
//         if (!page) throw new Error("Browser not opened!");
        
//         try {
//             await page.click(selector);
//             return `Clicked on element with selector: ${selector}`;
//         } catch (error: any) {
//             return `Failed to click: ${error.message}`;
//         }
//     },
// });

// const clickByText = tool({
//     name: 'clickByText',
//     description: 'clicks on an element by searching for text content',
//     parameters: z.object({ 
//         text: z.string(),
//         elementType: z.enum(['button', 'link', 'input', 'any']).default('any')
//     }),
//     async execute({ text, elementType }) {
//         console.log("Clicking by text", text, elementType)
//         if (!page) throw new Error("Browser not opened!");
        
//         try {
//             const elementSelectors = {
//                 button: 'button, input[type="button"], input[type="submit"]',
//                 link: 'a',
//                 input: 'input, textarea, select',
//                 any: '*'
//             };
            
//             const found = await page.locator(elementSelectors[elementType])
//                 .filter({ hasText: text }).first();
            
//             await found.click();
//             return `Clicked on ${elementType} with text: "${text}"`;
//         } catch (error: any) {
//             return `Failed to click: ${error.message}`;
//         }
//     },
// });

// const analyzePage = tool({
//     name: 'analyzePage',
//     description: 'analyzes the current page content, links, buttons, and form elements',
//     parameters: z.object({}),
//     async execute({}) {
//         if (!page) throw new Error("Browser not opened!");
//         await page.waitForLoadState('networkidle');
//         await delay(2000); // Wait a bit for dynamic content to load
//         const pageAnalysis = await page.evaluate(() => {
//             const analysis: any = {
//                 title: document.title,
//                 url: window.location.href,
//                 buttons: [],
//                 links: [],
//                 inputs: [],
//                 clickableElements: [],
//                 text: document.body.innerText.substring(0, 2000) // First 2000 chars
//             };

//             // Get all buttons
//             document.querySelectorAll('button, input[type="button"], input[type="submit"]').forEach((btn: any, index) => {
//                 analysis.buttons.push({
//                     index,
//                     text: btn.innerText || btn.value || 'No text',
//                     type: btn.type || 'button',
//                     id: btn.id || null,
//                     className: btn.className || null,
//                     selector: `button:nth-of-type(${index + 1})`
//                 });
//             });

//             // Get all links
//             document.querySelectorAll('a[href]').forEach((link: any, index) => {
//                 analysis.links.push({
//                     index,
//                     text: link.innerText.trim() || 'No text',
//                     href: link.href,
//                     id: link.id || null,
//                     selector: `a:nth-of-type(${index + 1})`
//                 });
//             });

//             // Get all input fields
//             document.querySelectorAll('input, textarea, select').forEach((input: any, index) => {
//                 analysis.inputs.push({
//                     index,
//                     type: input.type || 'text',
//                     placeholder: input.placeholder || null,
//                     name: input.name || null,
//                     id: input.id || null,
//                     selector: `input:nth-of-type(${index + 1})`
//                 });
//             });

//             // Get other clickable elements (divs, spans with click handlers)
//             document.querySelectorAll('[onclick], [role="button"], .btn, .button').forEach((el: any, index) => {
//                 if (!el.matches('button, input[type="button"], input[type="submit"], a')) {
//                     analysis.clickableElements.push({
//                         index,
//                         text: el.innerText?.trim().substring(0, 50) || 'No text',
//                         tagName: el.tagName.toLowerCase(),
//                         className: el.className || null,
//                         role: el.getAttribute('role') || null
//                     });
//                 }
//             });

//             return analysis;
//         });

//         const response =  `Page Analysis Complete:
// Title: ${pageAnalysis.title}
// URL: ${pageAnalysis.url}

// BUTTONS FOUND (${pageAnalysis.buttons.length}):
// ${pageAnalysis.buttons.map((btn: any) => `- "${btn.text}" (${btn.type})`).join('\n')}

// LINKS FOUND (${pageAnalysis.links.length}):
// ${pageAnalysis.links.slice(0, 10).map((link: any) => `- "${link.text}" -> ${link.href}`).join('\n')}

// INPUT FIELDS (${pageAnalysis.inputs.length}):
// ${pageAnalysis.inputs.map((input: any) => `- type: ${input.type}, placeholder: "${input.placeholder ||""}", name: ${input.name || 'unnamed'}, id: ${input.id || ""}`).join('\n')}

// CLICKABLE ELEMENTS (${pageAnalysis.clickableElements.length}):
// ${pageAnalysis.clickableElements.map((el: any) => `- ${el.tagName}: "${el.text}"`).join('\n')}

// PAGE TEXT PREVIEW:
// ${pageAnalysis.text.substring(0, 500)}...},`
//     console.log(response)
//     return response
// }});

// // Add a fill input tool as well
// const fillInput = tool({
//     name: 'fillInput',
//     description: 'fills an input field with specified text',
//     parameters: z.object({ 
//         selector: z.string(),
//         text: z.string()
//     }),
//     async execute({ selector, text }) {
//         if (!page) throw new Error("Browser not opened!");
//         console.log("Filling input", selector, text)
        
//         try {
//             await page.fill(selector, text);
//             return `Filled input with selector "${selector}" with: ${text}`
//         } catch (error: any) {
//             return `Failed to fill input: ${error.message}`;
//         }
//     },
// });

// const fillInputs = tool({
//   name: 'fillInputs',
//   description: 'Fills multiple input fields with specified text values',
//   parameters: z.object({
//     fields: z.array(
//       z.object({
//         selector: z.string(),
//         text: z.string()
//       })
//     )
//   }),
//   async execute({ fields }) {
//     if (!page) throw new Error("Browser not opened!");

//     const results: string[] = [];

//     for (const { selector, text } of fields) {
//       try {
//         console.log("Filling input", selector, text);
//         await page.fill(selector, text);
//         results.push(`✅ Filled "${selector}" with "${text}"`);
//       } catch (error: any) {
//         results.push(`❌ Failed to fill "${selector}": ${error.message}`);
//       }
//     }

//     return results;
//   },
// });

// const fillInputsByPlaceholder = tool({
//   name: 'fillInputsByPlaceholder',
//   description: 'Fills multiple input fields by their placeholder text',
//   parameters: z.object({
//     fields: z.array(
//       z.object({
//         placeholder: z.string(),
//         text: z.string()
//       })
//     )
//   }),
//   async execute({ fields }) {
//     if (!page) throw new Error("Browser not opened!");

//     const results: string[] = [];

//     for (const { placeholder, text } of fields) {
//       try {
//         console.log("Filling input with placeholder", placeholder, text);
//         await page.getByPlaceholder(placeholder).fill(text);
//         results.push(`✅ Filled input with placeholder "${placeholder}" with "${text}"`);
//       } catch (error: any) {
//         results.push(`❌ Failed to fill placeholder "${placeholder}": ${error.message}`);
//       }
//     }

//     return results;
//   },
// });


// let thread: AgentInputItem[] = [];

// const agent = new Agent({
//     name: 'Browser Automation bot',
//     instructions: `You are an advanced browser automation bot that can see and interact with web pages intelligently.

//     WORKFLOW:
//     1. When user asks to go to a website, launch browser first
//     2. Navigate to the requested website
//     3. Use analyzePage to understand what's on the page
//     4. Based on user's request and page analysis, decide what actions to take
//     5. Use appropriate tools to click buttons, fill forms, or navigate
//     6. IF you don't found anything one the page what user aksked you to do , Inform the user about it

//     AVAILABLE TOOLS:
//     - launchTheBrowser: Start the browser
//     - gotoawebsite: Navigate to a URL
//     - analyzePage: Get all clickable elements and page structure
//     - clickByText: Click on elements by their text content (preferred for buttons/links)
//     - clickBySelector: Click using CSS selectors (for precise targeting)
//     - fillInputs: Fill input fields with text
//     - googleSearch: Search on Google

//     DECISION MAKING:
//     - Always analyze the page first before taking actions
//     - Use clickByText for user-friendly elements (buttons, links with visible text)
//     - Use clickBySelector for precise element targeting
//     - Look for elements that match the user's intent
//     - If unsure about which element to click, describe the options to the user
//     - Be specific about what you're clicking and why
//     - If you have any input fields to fill, identify them clearly and fill with appropriate data and choose themm by placeholder selector firstly, if you didn't find any placeholder or duplicate placeholder then choose by Id to fill

//     EXAMPLES:
//     User: "Go to chaicode.com and click the login button"
//     1. Launch browser
//     2. Navigate to chaicode.com  
//     3. Analyze page to find login button
//     4. Use clickByText with "Login" or "Sign In"

//     User: "Fill the email field with test@example.com"
//     1. Analyze page to find email input
//     2. Use fillInput with the email field selector
    
//     user:"fill the message box with 'I am a bot' in guest book page"
//     1. Analyze page to find message box
//     (analyzePage will return input field with placeholder "Your message" and id "message")
//     2. Use fillInputsByPlaceholder with placeholder "Your message" and text "I am a bot"
//     `,
    

//     model: 'gpt-4o-mini',
//     tools: [
//         launchTheBrowser,
//         gotoawebsite, 
//         analyzePage,
//         clickByText,
//         clickBySelector,
//         fillInputsByPlaceholder,
//         fillInputs,
//         googleSearch
//     ],
// });

// //'can you go to https://ui.chaicode.com/ and open the sign up form and fill it up and submit'
// //go to https://www.piyushgarg.dev/ open guest book and sign with github , fill the login form (username : tathagata5121@gmail.com , password :Messi@7047) submit and post a message hi from bot
// // const result = await run(agent, "go to https://www.piyushgarg.dev/ open guest book and sign with github , fill the login form (username : tathagata5121@gmail.com , password :Messi@7047) once authorization is complemented type a message 'I am a bot' in mesage box", {
// //     context: { uid: 'abc', isProUser: true, fetchPurchases: async () => [] },
// // });

// async function userSays(text: string) {
//   const result = await run(
//     agent,
//     thread.concat({ role: 'user', content: text }),
//   );

//   thread = result.history; // Carry over history + newly generated items
//   console.log(result.history);
//   return result.finalOutput;
// }
// await userSays('can you go to https://ui.chaicode.com/ and open the sign up form and fill it up and submit it should be like a india user information')

// await userSays('Now can you fill up the login form with email , password and submit it')


