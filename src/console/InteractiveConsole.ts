import readline from 'readline';
import { AgentRunner } from '../agent/AgentRunner';

export class InteractiveConsole {
    protected rl: readline.Interface;
    protected agentRunner: AgentRunner;

    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '🤖 You: '
        });
        
        this.agentRunner = new AgentRunner();
        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        // Handle Ctrl+C gracefully
        this.rl.on('SIGINT', () => {
            this.handleExit();
        });

        // Handle process termination
        process.on('SIGTERM', () => {
            this.handleExit();
        });

        process.on('SIGINT', () => {
            this.handleExit();
        });
    }

    protected async handleExit() {
        console.log('\n\n🛑 Shutting down gracefully...');
        await this.agentRunner.cleanup();
        console.log('🧹 Browser cleanup completed');
        console.log('👋 Goodbye!');
        this.rl.close();
        process.exit(0);
    }

    protected askQuestion(question: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer.trim());
            });
        });
    }

    protected displayWelcome() {
        console.log('='.repeat(60));
        console.log('🤖 BROWSER AUTOMATION AGENT - Interactive Mode');
        console.log('='.repeat(60));
        console.log('💡 How it works:');
        console.log('   • Tell me what you want to do on any website');
        console.log('   • I\'ll ask for clarification if needed');
        console.log('   • Type "exit", "quit", or "bye" to stop');
        console.log('   • Press Ctrl+C to force quit');
        console.log('='.repeat(60));
        console.log('\n🚀 Ready to help! What would you like me to do?\n');
    }

    private displayThinking() {
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let i = 0;
        
        return setInterval(() => {
            process.stdout.write(`\r🤖 Agent: ${frames[i]} Thinking...`);
            i = (i + 1) % frames.length;
        }, 100);
    }

    private stopThinking(spinner: NodeJS.Timeout) {
        clearInterval(spinner);
        process.stdout.write('\r🤖 Agent: ');
    }

    protected async processUserInput(input: string): Promise<string> {
        // Check for exit commands
        const exitCommands = ['exit', 'quit', 'bye', 'stop'];
        if (exitCommands.includes(input.toLowerCase())) {
            await this.handleExit();
            return '';
        }

        // Check for help command
        if (input.toLowerCase() === 'help') {
            return this.getHelpMessage();
        }

        // Check for clear command
        if (input.toLowerCase() === 'clear') {
            console.clear();
            this.displayWelcome();
            return '';
        }

        try {
            // Show thinking animation
            const spinner = this.displayThinking();
            
            // Process the user's request
            const response = await this.agentRunner.userSays(input);
            
            // Stop thinking animation
            this.stopThinking(spinner);
            
            return response;
        } catch (error: any) {
            return `❌ Error: ${error.message}\n\n💡 Tip: Try being more specific about what you want me to do.`;
        }
    }

    private getHelpMessage(): string {
        return `
            📖 HELP - Available Commands:
            • help       - Show this help message
            • clear      - Clear the screen
            • exit/quit  - Exit the application

            🎯 Example requests:
            • "Go to google.com and search for typescript"
            • "Fill out a form on example.com with test data"
            • "Take a screenshot of the current page"
            • "Click on the login button and fill the form"

            💡 Tips:
            • Be specific about which website to visit
            • Mention what actions you want me to perform
            • I can ask for clarification if needed
        `;
    }

    async start() {
        this.displayWelcome();

        while (true) {
            try {
                // Get user input
                const userInput = await this.askQuestion('🤖 You: ');
                
                if (!userInput) {
                    console.log('💭 Please tell me what you\'d like me to do!\n');
                    continue;
                }

                // Process the input
                const response = await this.processUserInput(userInput);
                
                if (response) {
                    console.log(`🤖 Agent: ${response}\n`);
                }

                // Check if agent needs more information
                if (response.includes('need more information') || 
                    response.includes('clarify') || 
                    response.includes('specific')) {
                    
                    console.log('💡 The agent might need more details. Feel free to provide more specific instructions!\n');
                }

            } catch (error: any) {
                console.log(`❌ Unexpected error: ${error.message}\n`);
                console.log('🔄 Let\'s try again...\n');
            }
        }
    }
}