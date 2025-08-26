import dotenv from 'dotenv';
import { ConsoleManager, ConsoleMode } from './console/ConsoleManager';

// Load environment variables
dotenv.config();

/**
 * Main application entry point
 */
async function main() {
    try {
        // Check for help flag
        const args = process.argv.slice(2);
        if (args.includes('--help') || args.includes('-h')) {
            ConsoleManager.displayUsage();
            return;
        }

        // Parse command line arguments to determine mode
        const mode = ConsoleManager.parseCommandLineMode();
        
        // Show mode selection info
        if (!args.length) {
            console.log('🎯 Starting with default CONVERSATIONAL mode...\n');
        } else {
            console.log(`🎯 Starting in ${mode.toUpperCase()} mode...\n`);
        }

        // Create and initialize console manager
        const consoleManager = new ConsoleManager();
        await consoleManager.initializeConsole(mode);

        // Start the console application
        await consoleManager.start();

    } catch (error: any) {
        console.error('💥 Fatal error occurred:');
        console.error(error.message);
        console.error('\n🔧 Try running with --help flag for usage information');
        process.exit(1);
    }
}

/**
 * Handle uncaught exceptions gracefully
 */
process.on('uncaughtException', (error) => {
    console.error('\n💥 Uncaught Exception:', error.message);
    console.error('🛑 Application will exit...');
    process.exit(1);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('\n💥 Unhandled Promise Rejection at:', promise);
    console.error('Reason:', reason);
    console.error('🛑 Application will exit...');
    process.exit(1);
});

// Run the application
main().catch((error) => {
    console.error('💥 Application failed to start:', error.message);
    process.exit(1);
});