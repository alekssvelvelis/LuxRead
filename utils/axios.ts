import axios from "axios";
import { randomizeUserAgent } from "./userAgents";

type HeaderOptions = {
  headers?: Record<string, string>;
};

export async function fetchHtml(url: string, options: HeaderOptions = {}, timeout?: number,) {
  const userAgent = randomizeUserAgent();

  try {
    const response = await axios.get(url, {
        timeout: timeout ? timeout : 15000, // ms

        headers: {
            "User-Agent": userAgent,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "en-US,en;q=0.9",
            ...options.headers
        },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        if (error.response) {
            throw new Error(`Request failed with status ${error.response.status} for ${url}`, { cause: error });
        }

        if (error.request) {
            throw new Error(`No response received from ${url}`, { cause: error });
        }

        throw new Error(`Request setup failed: ${error.message}`, { cause: error });
    } else {
        throw new Error(`Something went wrong with fetchHtml in utils/axios.ts`, { cause: error });
    }
  }
}