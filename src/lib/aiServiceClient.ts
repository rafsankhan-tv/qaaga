/**
 * Secure Internal AI Microservice Client
 * Communicates strictly on the server-side with the Python FastAPI AI Service.
 * Never exposed to browser or client components.
 */

export interface InternalAIChatMessage {
  role: 'user' | 'model' | 'assistant' | 'system';
  content: string;
}

export interface InternalAIChatRequest {
  messages: InternalAIChatMessage[];
  systemInstruction?: string;
  temperature?: number;
  contextData?: Record<string, any>;
}

export interface InternalAIChatResponse {
  success: boolean;
  reply: string;
  model: string;
  usage?: Record<string, any>;
}

export class AIServiceClient {
  private baseUrl: string | null = null;
  private secretKey: string | null = null;
  private readonly timeoutMs: number = 10000;

  constructor() {
    this.baseUrl = process.env.AI_SERVICE_URL ? process.env.AI_SERVICE_URL.replace(/\/$/, '') : null;
    this.secretKey = process.env.AI_SERVICE_SECRET_KEY || process.env.AI_SERVICE_SECRET || null;
  }

  /**
   * Returns true if the internal AI microservice URL is configured.
   */
  public isConfigured(): boolean {
    return !!(this.baseUrl && this.baseUrl.trim().length > 0);
  }

  /**
   * Prepare secure internal headers.
   */
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Caller-Service': 'qaaga-nextjs-backend',
    };

    if (this.secretKey) {
      headers['X-Internal-Service-Key'] = this.secretKey;
      headers['Authorization'] = `Bearer ${this.secretKey}`;
    }

    return headers;
  }

  /**
   * Send a chat completion request to the internal FastAPI AI service.
   */
  public async chatCompletion(params: InternalAIChatRequest): Promise<InternalAIChatResponse> {
    if (!this.baseUrl) {
      throw new Error('AI_SERVICE_URL is not configured');
    }

    const endpoint = `${this.baseUrl}/ai/chat`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          messages: params.messages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : m.role,
            content: m.content,
          })),
          system_instruction: params.systemInstruction,
          temperature: params.temperature ?? 0.7,
          context_data: params.contextData,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`AI Service returned HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const data = await response.json();
      return {
        success: !!data.success,
        reply: data.reply || '',
        model: data.model || 'fastapi-ai',
        usage: data.usage,
      };
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error(`Internal AI Service timed out after ${this.timeoutMs}ms`);
      }
      throw err;
    }
  }

  /**
   * Check microservice health status.
   */
  public async healthCheck(): Promise<{ ok: boolean; data?: any; error?: string }> {
    if (!this.baseUrl) {
      return { ok: false, error: 'AI_SERVICE_URL not configured' };
    }

    try {
      const endpoint = `${this.baseUrl}/health`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) {
        return { ok: false, error: `Healthcheck HTTP ${response.status}` };
      }

      const data = await response.json();
      return { ok: true, data };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Connection failed' };
    }
  }
}

export const aiServiceClient = new AIServiceClient();
