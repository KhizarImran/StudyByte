export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    isThinking?: boolean;
    metadata?: {
        ragContext?: string;
        toolCalls?: Array<{
            tool: string;
            input: string;
            output: string;
        }>;
    };
}

export interface ChatState {
    messages: Message[];
    isLoading: boolean;
}

export type StreamCallback = (
    chunk: string, 
    isComplete: boolean, 
    fullContent: string, 
    metadata?: Message['metadata']
) => void; 