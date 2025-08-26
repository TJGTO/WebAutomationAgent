// Types for DOM analysis
export interface ElementInfo {
    index: number;
    text: string;
    type?: string;
    id?: string | null;
    className?: string | null;
    selector?: string;
    href?: string;
    placeholder?: string | null;
    name?: string | null;
    tagName?: string;
    role?: string | null;
}

export interface PageAnalysis {
    title: string;
    url: string;
    buttons: ElementInfo[];
    links: ElementInfo[];
    inputs: ElementInfo[];
    clickableElements: ElementInfo[];
    text: string;
}

// Form field types
export interface FormField {
    selector?: string;
    placeholder?: string;
    text: string;
}

// Agent conversation types
export interface ConversationHistory {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}