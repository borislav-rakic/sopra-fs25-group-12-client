import { getApiDomain } from "@/utils/domain";

export class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = getApiDomain();
    this.defaultHeaders = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    };
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    const cleanedToken = token && token.startsWith('"') && token.endsWith('"')
      ? token.slice(1, -1)
      : token;

    return {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...(cleanedToken ? { Authorization: `Bearer ${cleanedToken}` } : {}),
    };
  }

  private async processResponse<T>(
    res: Response,
    contextMessage: string,
    method: string,
  ): Promise<T> {
    const url = res.url;
    const status = res.status;
    const statusText = res.statusText;

    if (!res.ok) {
      const contentType = res.headers.get("Content-Type");
      let errorDetail = "";

      if (contentType?.includes("application/json")) {
        const errorJson = await res.json();
        errorDetail = errorJson.message ||
          errorJson.error || // <- pick Spring Boot's "error" field if present
          "An unknown error occurred.";
      } else {
        errorDetail = await res.text();
      }

      // Build full and user-facing messages
      const fullMessage =
        `[${method}] ${url}: ${status} ${statusText} - ${errorDetail}`;
      const isClientError = status >= 400 && status < 500;
      const userMessage = isClientError && errorDetail
        ? `${contextMessage.trim()} ${errorDetail}`
        : `${contextMessage.trim()} (${status})`;

      // Create and enrich the error object
      const error = new Error(userMessage) as Error & {
        status?: number;
        detail?: string;
        fullMessage?: string;
      };
      error.status = status;
      error.detail = errorDetail;
      error.fullMessage = fullMessage;

      // Log full detail, if needed
      console.warn(fullMessage);

      throw error;
    }

    if (status === 204) {
      return {} as T;
    }

    const text = await res.text();
    if (!text) {
      return {} as T;
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`[${method}] ${url}: Invalid JSON response`);
    }
  }

  public async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
  ): Promise<T> {
    let url = `${this.baseURL}${endpoint}`;

    if (params) {
      const query = new URLSearchParams();
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          query.append(key, String(params[key]));
        }
      }
      url += `?${query.toString()}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.processResponse<T>(
      res,
      "An error occurred while fetching the data.\n",
      "GET",
    );
  }

  public async post<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.processResponse<T>(
      res,
      "An error occurred while posting the data.\n",
      "POST",
    );
  }

  public async put<T>(endpoint: string, data: unknown): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.processResponse<T>(
      res,
      "An error occurred while updating the data.\n",
      "PUT",
    );
  }

  public async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.processResponse<T>(
      res,
      "An error occurred while deleting the data.\n",
      "DELETE",
    );
  }
}
