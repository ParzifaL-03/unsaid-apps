import { apiErrorSchema, apiResponseSchema } from "@/contracts/common";
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { ZodType } from "zod";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api"
).replace(/\/$/, "");

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  validateStatus: () => true,
  headers: {
    Accept: "application/json",
  },
});

export type ApiRequestMiddleware = (
  config: InternalAxiosRequestConfig,
) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>;

export type ApiResponseMiddleware<T = unknown> = (
  response: AxiosResponse<T>,
) => AxiosResponse<T> | Promise<AxiosResponse<T>>;

apiClient.interceptors.request.use((config) => {
  config.headers = AxiosHeaders.from(config.headers);
  config.headers.set("X-Requested-With", "XMLHttpRequest");
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(error),
);

export function registerApiRequestMiddleware(
  middleware: ApiRequestMiddleware,
  onError?: (error: AxiosError) => unknown,
) {
  const interceptorId = apiClient.interceptors.request.use(middleware, onError);
  return () => apiClient.interceptors.request.eject(interceptorId);
}

export function registerApiResponseMiddleware<T = unknown>(
  middleware: ApiResponseMiddleware<T>,
  onError?: (error: AxiosError) => unknown,
) {
  const interceptorId = apiClient.interceptors.response.use(
    middleware,
    onError,
  );
  return () => apiClient.interceptors.response.eject(interceptorId);
}

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  schema: ZodType<T>,
  config?: AxiosRequestConfig,
) {
  const response = await apiClient.request<unknown>({
    url: path,
    ...config,
  });

  if (response.status < 200 || response.status >= 300) {
    const parsedError = apiErrorSchema.safeParse(response.data);
    throw new ApiClientError(
      parsedError.success
        ? parsedError.data.data.error.message
        : "Request failed.",
      response.status,
      response.data,
    );
  }

  const parsedEnvelope = apiResponseSchema(schema).safeParse(response.data);
  if (!parsedEnvelope.success) {
    console.error("Invalid API response envelope", {
      path,
      response: response.data,
      error: parsedEnvelope.error,
    });
    throw new ApiClientError(
      "The server returned an unexpected response.",
      response.status,
      response.data,
    );
  }

  if (!parsedEnvelope.data.status) {
    throw new ApiClientError(
      "Request failed.",
      parsedEnvelope.data.statusCode,
      parsedEnvelope.data,
    );
  }

  return parsedEnvelope.data.data;
}
