import { run } from '@openai/agents';
import type { AgentInputItem } from '@openai/agents';
import { createBrowserAgent } from './AgentConfig';
import { BrowserManager } from '../utils/BrowserManager';

export class AgentRunner {
    private thread: AgentInputItem[] = [];
    private agent = createBrowserAgent();

    public async userSays(text: string): Promise<string> {
        try {
            const result = await run(
                this.agent,
                this.thread.concat({ role: 'user', content: text }),
            );

            this.thread = result.history; // Carry over history + newly generated items
            console.log('Agent Response History:', result.history);
            return result.finalOutput || 'No response from agent';
        } catch (error) {
            console.error('Error running agent:', error);
            throw error;
        }
    }

    public async cleanup(): Promise<void> {
        const browserManager = BrowserManager.getInstance();
        if (browserManager.isLaunched()) {
            await browserManager.closeBrowser();
        }
    }

    public clearHistory(): void {
        this.thread = [];
    }

    public getHistory(): AgentInputItem[] {
        return [...this.thread];
    }
}