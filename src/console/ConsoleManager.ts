import { InteractiveConsole } from './InteractiveConsole';
import { ConversationalAgent } from './ConversationalAgent';

export enum ConsoleMode {
    BASIC = 'basic',
    ENHANCED = 'enhanced',
    CONVERSATIONAL = 'conversational'
}

export class ConsoleManager {
    private console: InteractiveConsole | null = null;

    constructor() {}

    /**
     * Initialize the console with specified mode
     */
    public async initializeConsole(mode: ConsoleMode): Promise<void> {
        console.clear();
        
        switch (mode) {
            case ConsoleMode.BASIC:
                console.log('🤖 Initializing Basic Interactive Console...\n');
                this.console = new InteractiveConsole();
                break;
                
            case ConsoleMode.ENHANCED:
            case ConsoleMode.CONVERSATIONAL:
                console.log('🧠 Initializing Enhanced Conversational Console...\n');
                this.console = new ConversationalAgent();
                break;
                
            default:
                throw new Error(`Unknown console mode: ${mode}`);
        }
    }

    /**
     * Start the console application
     */
    public async start(): Promise<void> {
        if (!this.console) {
            throw new Error('Console not initialized. Call initializeConsole() first.');
        }

        await this.console.start();
    }

    /**
     * Get available console modes with descriptions
     */
    public static getAvailableModes(): { mode: ConsoleMode; description: string; recommended: string }[] {
        return [
            {
                mode: ConsoleMode.BASIC,
                description: 'Simple interactive mode without memory',
                recommended: 'Quick, one-off tasks'
            },
            {
                mode: ConsoleMode.CONVERSATIONAL,
                description: 'Smart mode with conversation history and context',
                recommended: 'Complex, multi-step workflows'
            }
        ];
    }

    /**
     * Display mode selection menu
     */
    public static displayModeSelection(): void {
        console.log('='.repeat(70));
        console.log('🚀 BROWSER AUTOMATION AGENT - Mode Selection');
        console.log('='.repeat(70));
        
        const modes = ConsoleManager.getAvailableModes();
        
        modes.forEach((modeInfo, index) => {
            console.log(`\n${index + 1}. ${modeInfo.mode.toUpperCase()} MODE`);
            console.log(`   📝 ${modeInfo.description}`);
            console.log(`   💡 Best for: ${modeInfo.recommended}`);
        });
        
        console.log('\n' + '='.repeat(70));
        console.log('💭 Choose your preferred mode for the best experience!');
        console.log('='.repeat(70) + '\n');
    }

    /**
     * Parse command line arguments to determine mode
     */
    public static parseCommandLineMode(): ConsoleMode {
        const args = process.argv.slice(2);
        
        if (args.includes('--basic') || args.includes('-b')) {
            return ConsoleMode.BASIC;
        }
        
        if (args.includes('--enhanced') || args.includes('-e') || 
            args.includes('--conversational') || args.includes('-c')) {
            return ConsoleMode.CONVERSATIONAL;
        }
        
        // Default mode
        return ConsoleMode.CONVERSATIONAL;
    }

    /**
     * Display usage information
     */
    public static displayUsage(): void {
        console.log(`
            🔧 USAGE:
            npm run dev                    # Start with conversational mode (default)
            npm run dev -- --basic        # Start with basic mode
            npm run dev -- --enhanced     # Start with conversational mode
            
            📋 AVAILABLE FLAGS:
            --basic, -b          Basic interactive mode (no memory)
            --enhanced, -e       Enhanced conversational mode (with memory)
            --conversational, -c Enhanced conversational mode (with memory)
            --help, -h          Show this help message

            🎯 EXAMPLES:
            npm run dev                    # Best for most users
            npm run dev -- --basic        # For simple, quick tasks
            npm run dev -- --enhanced     # For complex workflows
        `);
    }
}