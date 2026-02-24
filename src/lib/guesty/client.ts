export class GuestyApiClient {
  private baseUrl: string;
  private token: string;

  constructor() {
    this.baseUrl =
      process.env.GUESTY_API_BASE_URL || "https://open-api.guesty.com/v1";
    this.token = process.env.GUESTY_API_TOKEN || "";
  }

  isConfigured(): boolean {
    return this.token.length > 0;
  }

  async get<T>(
    path: string,
    params?: Record<string, string>,
    revalidate = 3600
  ): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/json",
      },
      next: { revalidate },
    });
    if (!res.ok) {
      throw new Error(`Guesty API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
  }
}
