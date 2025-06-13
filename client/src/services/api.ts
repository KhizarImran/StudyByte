import axios, { AxiosError } from 'axios';
import { StreamCallback } from '../types/chat';

// Environment-aware API configuration
const isDevelopment = import.meta.env.DEV;
const API_URL = isDevelopment ? 'http://localhost:8000' : '/api';
const WS_URL = isDevelopment ? 'ws://localhost:8000' : 
    `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api`;

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
                    timeout: 30000, // Increased timeout for serverless functions
                }
            );
            
            return response.data;
        } catch (error) {
            return handleAxiosError(error);
        }
    },

    // WebSocket streaming implementation
    // Note: WebSocket functionality may be limited on Vercel serverless functions
    // Consider implementing Server-Sent Events (SSE) as an alternative
    async sendMessageStream(message: string, onStream: StreamCallback, context?: string): Promise<void> {
        // For production deployment, fall back to non-streaming if WebSocket fails
        if (!isDevelopment) {
            console.warn('WebSocket streaming may not work on Vercel. Using fallback to regular API call.');
            try {
                const response = await this.sendMessage(message, context);
                onStream(response.answer, true, response.answer);
                return;
            } catch (error) {
                throw error;
            }
        }

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