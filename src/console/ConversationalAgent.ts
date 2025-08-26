import { InteractiveConsole } from './InteractiveConsole';

interface ConversationEntry {
    role: 'user' | 'agent';
    message: string;
    timestamp: Date;
}

export class ConversationalAgent extends InteractiveConsole {
    private conversationHistory: ConversationEntry[] = [];
    private readonly MAX_HISTORY_LENGTH = 20; // Keep last 20 exchanges

    constructor() {
        super();
    }

    private addToHistory(role: 'user' | 'agent', message: string) {
        this.conversationHistory.push({
            role,
            message,
            timestamp: new Date()
        });

        // Keep history size manageable
        if (this.conversationHistory.length > this.MAX_HISTORY_LENGTH) {
            this.conversationHistory = this.conversationHistory.slice(-this.MAX_HISTORY_LENGTH);
        }
    }

    private buildContextualPrompt(currentInput: string, history: ConversationEntry[]): string {
        if (history.length <= 1) {
            return currentInput;
        }

        let contextPrompt = "Previous conversation context:\n";
        
        // Use last 6 exchanges for context (3 back and forth)
        const recentHistory = history.slice(-6, -1);
        
        recentHistory.forEach((entry) => {
            const role = entry.role === 'user' ? 'User' : 'Agent';
            contextPrompt += `${role}: ${entry.message}\n`;
        });
        
        contextPrompt += `\nCurrent request: ${currentInput}`;
        contextPrompt += `\n\nNote: Please consider the conversation context above when responding to the current request.`;
        
        return contextPrompt;
    }

    protected displayWelcome() {
        console.log('='.repeat(60));
        console.log('🧠 BROWSER AUTOMATION AGENT - Conversational Mode');
        console.log('='.repeat(60));
        console.log('✨ Enhanced Features:');
        console.log('   • Remembers our conversation history');
        console.log('   • Understands context from previous exchanges');
        console.log('   • Better for multi-step tasks');
        console.log('   • Can reference earlier requests');
        console.log('='.repeat(60));
        console.log('💡 How it works:');
        console.log('   • Tell me what you want to do on any website');
        console.log('   • I\'ll remember our conversation for better context');
        console.log('   • Type "exit", "quit", or "bye" to stop');
        console.log('   • Type "history" to see recent conversation');
        console.log('   • Press Ctrl+C to force quit');
        console.log('='.repeat(60));
        console.log('\n🚀 Ready for an intelligent conversation! What shall we do?\n');
    }

    private showConversationHistory(): string {
        if (this.conversationHistory.length === 0) {
            return '📝 No conversation history yet. Start by asking me to do something!';
        }

        let historyStr = '📝 Recent Conversation History:\n';
        historyStr += '─'.repeat(40) + '\n';

        // Show last 10 exchanges
        const recentHistory = this.conversationHistory.slice(-10);
        
        recentHistory.forEach((entry, index) => {
            const timeStr = entry.timestamp.toLocaleTimeString();
            const role = entry.role === 'user' ? '🧑 You' : '🤖 Agent';
            const message = entry.message.length > 100 ? 
                entry.message.substring(0, 100) + '...' : 
                entry.message;
            
            historyStr += `[${timeStr}] ${role}: ${message}\n`;
            
            if (index < recentHistory.length - 1) {
                historyStr += '\n';
            }
        });

        historyStr += '\n' + '─'.repeat(40);
        return historyStr;
    }

    protected async processUserInput(input: string): Promise<string> {
        // Check for history command
        if (input.toLowerCase() === 'history') {
            return this.showConversationHistory();
        }

        // Check for reset/clear history command
        if (input.toLowerCase() === 'reset' || input.toLowerCase() === 'clear history') {
            this.conversationHistory = [];
            return '🧹 Conversation history cleared! Starting fresh.';
        }

        // Add user message to history
        this.addToHistory('user', input);

        // Build contextual prompt with conversation history
        const contextualInput = this.buildContextualPrompt(input, this.conversationHistory);

        // Process with context using parent method
        const response = await super.processUserInput(contextualInput);
        
        // Add agent response to history (if not empty)
        if (response && response.trim()) {
            this.addToHistory('agent', response);
        }

        return response;
    }

    // Method to get conversation summary
    public getConversationSummary(): string {
        const totalExchanges = Math.floor(this.conversationHistory.length / 2);
        const userMessages = this.conversationHistory.filter(entry => entry.role === 'user').length;
        const agentMessages = this.conversationHistory.filter(entry => entry.role === 'agent').length;

        return `
            📊 Conversation Summary:
            • Total exchanges: ${totalExchanges}
            • User messages: ${userMessages}
            • Agent responses: ${agentMessages}
            • History length: ${this.conversationHistory.length} entries
        `;
    }

    // Override start method to show enhanced welcome
    async start() {
        console.log('🧠 Enhanced conversational mode activated!\n');
        await super.start();
    }
}