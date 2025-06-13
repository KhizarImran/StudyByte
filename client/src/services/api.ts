import axios, { AxiosError } from 'axios';
import { StreamCallback } from '../types/chat';

const API_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000';

interface ChatResponse {
    answer: string;
    context?: string;
}

interface ErrorResponse {
    detail: string;
}

interface StreamMessage {
    type: 'stream' | 'end' | 'error';
    content: string;
    full_content?: string;
    metadata?: {
        ragContext?: string;
        toolCalls?: Array<{
            tool: string;
            input: string;
            output: string;
        }>;
    };
}

// Helper for error handling
const handleAxiosError = (error: unknown): never => {
    console.error('API Error:', error);
    
    if (error instanceof AxiosError) {
        if (!error.response) {
            throw new Error('Connection failed. Please check if the server is running.');
        }
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.detail || `Server error: ${error.response.status}`);
    }
    
    throw new Error('An unexpected error occurred.');
};

export const chatService = {
    // Non-streaming API call
    async sendMessage(message: string, context?: string): Promise<ChatResponse> {
        try {
            const response = await axios.post<ChatResponse>(
                `${API_URL}/chat/with-context`,
                { message, context },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    timeout: 10000,
                }
            );
            
            return response.data;
        } catch (error) {
            return handleAxiosError(error);
        }
    },

    // WebSocket streaming implementation
    async sendMessageStream(message: string, onStream: StreamCallback, context?: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`${WS_URL}/ws/chat`);
            
            ws.onopen = () => {
                ws.send(JSON.stringify({ message, context }));
            };

            ws.onmessage = (event) => {
                try {
                    const data: StreamMessage = JSON.parse(event.data);
                    
                    switch (data.type) {
                        case 'stream':
                            onStream(data.content, false, data.full_content || '', data.metadata);
                            break;
                        case 'end':
                            onStream(data.content, true, data.content, data.metadata);
                            ws.close();
                            resolve();
                            break;
                        case 'error':
                            reject(new Error(data.content));
                            ws.close();
                            break;
                    }
                } catch (error) {
                    reject(error);
                    ws.close();
                }
            };

            ws.onerror = () => {
                reject(new Error('WebSocket connection error'));
            };

            ws.onclose = () => {
                // If we didn't resolve yet, this was an unexpected close
                // This redundant resolve is safe and prevents potential hangs
                resolve();
            };
        });
    }
}; 