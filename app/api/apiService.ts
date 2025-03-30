import { getApiDomain } from "@/utils/domain";
import { ApplicationError } from "@/types/error";



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
    let token = localStorage.getItem("token");
    let cleanedToken = token;

    if (token && token.startsWith('"') && token.endsWith('"')) {
      cleanedToken = token.slice(1, -1);
    }

    return {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...(cleanedToken ? { Authorization: `Bearer ${cleanedToken}` } : {}),
    };
  }

  /**
   * Helper function to check the response, parse JSON,
   * and throw an error if the response is not OK.
   *
   * @param res - The response from fetch.
   * @param errorMessage - A descriptive error message for this call.
   * @returns Parsed JSON data.
   * @throws ApplicationError if res.ok is false.
   */
  private async processResponse<T>(res: Response, errorMsg: string): Promise<T> {
    if (!res.ok) {
      const contentType = res.headers.get("Content-Type");
      let errorDetail = "";

      if (contentType && contentType.includes("application/json")) {
        const errorJson = await res.json();
        errorDetail = errorJson.message || JSON.stringify(errorJson);
      } else {
        errorDetail = await res.text();
      }

      throw new Error(`${errorMsg}${res.status} ${res.statusText}: ${errorDetail}`);
    }

    // Try parsing response body
    try {
      return await res.json();
    } catch {
      throw new Error(`${errorMsg}Invalid JSON response.`);
    }
  }


  /**
   * GET request.
   * @param endpoint - The API endpoint (e.g. "/users").
   * @returns JSON data of type T.
   */
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = `${this.baseURL}${endpoint}`;

    // Add query params if present
    if (params) {
      const query = new URLSearchParams();
      for (const key in params) {
        if (params[key] !== undefined && params[key] !== null) {
          query.append(key, params[key]);
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
    );
  }


  /**
   * POST request.
   * @param endpoint - The API endpoint (e.g. "/users").
   * @param data - The payload to post.
   * @returns JSON data of type T.
   */
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
    );
  }

  /**
   * PUT request.
   * @param endpoint - The API endpoint (e.g. "/users/123").
   * @param data - The payload to update.
   * @returns JSON data of type T.
   */
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
    );
  }

  /**
   * DELETE request.
   * @param endpoint - The API endpoint (e.g. "/users/123").
   * @returns JSON data of type T.
   */
  public async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    return this.processResponse<T>(
      res,
      "An error occurred while deleting the data.\n",
    );
  }
}
