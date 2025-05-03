import { CMS_BASE_URL } from "../constants/ApiPaths";
import { cleanObject } from "../utils/common-utils";

const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface ApiError extends Error {
	status?: number;
	data?: unknown;
}

interface RequestOptions extends RequestInit {
	params?: Record<string, string>;
	onProgress?: (progress: number) => void;
	timeout?: number;
}

interface ApiResponse<T> {
	data: T;
	status: number;
	headers: Headers;
}

/**
 * Creates a timeout promise that rejects after the specified duration
 */
const createTimeoutPromise = (timeoutDuration: number): Promise<never> => {
	return new Promise((_, reject) => {
		setTimeout(() => {
			reject(new Error(`Request timed out after ${timeoutDuration}ms`));
		}, timeoutDuration);
	});
};

/**
 * Handles the streaming response for progress tracking
 */
const handleStreamResponse = async <T>(
	response: Response,
	onProgress?: (progress: number) => void
): Promise<T> => {
	const reader = response.body?.getReader();
	const contentLength = parseInt(response.headers.get("Content-Length") ?? "0");

	if (!reader || !contentLength) {
		return response.json();
	}

	const stream = new ReadableStream({
		async start(controller) {
			let loadedBytes = 0;

			try {
				while (true) {
					const { done, value } = await reader.read();

					if (done) {
						break;
					}

					loadedBytes += value.length;
					onProgress?.(Math.round((loadedBytes / contentLength) * 100));
					controller.enqueue(value);
				}

				controller.close();
				reader.releaseLock();
			} catch (error) {
				controller.error(error);
				reader.releaseLock();
			}
		},
	});

	const progressResponse = new Response(stream, {
		headers: response.headers,
		status: response.status,
		statusText: response.statusText,
	});

	return progressResponse.json();
};

/**
 * Base request function that handles common HTTP request logic
 */
async function request<T>(
	endpoint: string,
	options: RequestOptions = {},
	baseUrl: string = CMS_BASE_URL
): Promise<ApiResponse<T>> {
	const {
		params,
		onProgress,
		timeout = DEFAULT_TIMEOUT,
		...fetchOptions
	} = options;

	const url = new URL(`${baseUrl}${endpoint}`);
	if (params) {
		Object.keys(params).forEach((key) =>
			url.searchParams.append(key, params[key])
		);
	}

	try {
		const response = await Promise.race([
			fetch(url.toString(), fetchOptions),
			createTimeoutPromise(timeout),
		]);

		if (!response.ok) {
			const error = new Error(
				`HTTP error! status: ${response.status}`
			) as ApiError;
			error.status = response.status;
			try {
				error.data = await response.json();
			} catch {
				// If response is not JSON, use text
				error.data = await response.text();
			}
			throw error;
		}

		const data = onProgress
			? await handleStreamResponse<T>(response, onProgress)
			: await response.json();

		return {
			data,
			status: response.status,
			headers: response.headers,
		};
	} catch (error) {
		if (error instanceof Error) {
			throw error;
		}
		throw new Error("An unknown error occurred");
	}
}

/**
 * Creates headers with authentication token
 */
async function createAuthHeaders(
	existingHeaders?: HeadersInit
): Promise<Headers> {
	const token = process.env.NEXT_PUBLIC_CMS_TOKEN;
	const headers = new Headers(existingHeaders);
	headers.append("Authorization", `Bearer ${token}`);
	return headers;
}

/**
 * `httpClient` is an object that provides methods for making HTTP requests to the API.
 * It supports both anonymous and authenticated requests.
 *
 * Anonymous requests do not require an authentication token, while authenticated requests do.
 *
 * The `httpClient` object has two properties: `anonymous` and `authenticated`.
 * Each of these properties has four methods: `get`, `post`, `put`, and `delete`.
 * These methods correspond to the HTTP methods of the same name.
 *
 * The `get`, `post`, `put`, and `delete` methods all take an `endpoint` argument,
 * which is the path to the API endpoint to make the request to.
 *
 * The `post` and `put` methods also take a `data` argument, which is the data to send
 * in the request body. The data will be cleaned by removing properties that are null or empty strings.
 *
 * All methods take an optional `options` argument, which is an object that can be used
 * to specify additional options for the request, such as headers or query parameters.
 *
 * The `authenticated` methods will automatically add an `Authorization` header to the
 * request with the current user's ID token.
 */
export const httpClient = {
	/**
	 * `anonymous` contains methods for making HTTP requests without authentication.
	 * Each method corresponds to a standard HTTP method (GET, POST, PUT, DELETE).
	 *
	 * - `get<T>(endpoint: string, options?: RequestOptions)`:
	 *   Makes a GET request to the specified endpoint.
	 *
	 * - `post<T>(endpoint: string, data: unknown, options?: RequestOptions)`:
	 *   Makes a POST request to the specified endpoint with the provided data.
	 *   The data is cleaned to remove null or empty string properties before being sent.
	 *
	 * - `put<T>(endpoint: string, data: unknown, options?: RequestOptions)`:
	 *   Makes a PUT request to the specified endpoint with the provided data.
	 *   The data is cleaned to remove null or empty string properties before being sent.
	 *
	 * - `delete<T>(endpoint: string, options?: RequestOptions)`:
	 *   Makes a DELETE request to the specified endpoint.
	 */
	anonymous: {
		get: <T>(endpoint: string, options?: RequestOptions) =>
			request<T>(endpoint, { ...options, method: "GET" }),

		post: <T>(endpoint: string, data: unknown, options?: RequestOptions) =>
			request<T>(endpoint, {
				...options,
				method: "POST",
				headers: {
					...options?.headers,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(cleanObject(data)),
			}),

		put: <T>(endpoint: string, data: unknown, options?: RequestOptions) =>
			request<T>(endpoint, {
				...options,
				method: "PUT",
				headers: {
					...options?.headers,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(cleanObject(data)),
			}),

		delete: <T>(endpoint: string, options?: RequestOptions) =>
			request<T>(endpoint, { ...options, method: "DELETE" }),
	},

	/**
	 * `authenticated` contains methods for making HTTP requests with authentication.
	 * Each method corresponds to a standard HTTP method (GET, POST, PUT, DELETE).
	 *
	 * - `get<T>(endpoint: string, options?: RequestOptions)`:
	 *   Makes an authenticated GET request to the specified endpoint.
	 *
	 * - `post<T>(endpoint: string, data: unknown, options?: RequestOptions)`:
	 *   Makes an authenticated POST request to the specified endpoint with the provided data.
	 *   The data is cleaned to remove null or empty string properties before being sent.
	 *
	 * - `put<T>(endpoint: string, data: unknown, options?: RequestOptions)`:
	 *   Makes an authenticated PUT request to the specified endpoint with the provided data.
	 *   The data is cleaned to remove null or empty string properties before being sent.
	 *
	 * - `delete<T>(endpoint: string, options?: RequestOptions)`:
	 *   Makes an authenticated DELETE request to the specified endpoint.
	 */
	cms_authenticated: {
		get: async <T>(endpoint: string, options?: RequestOptions) => {
			const headers = await createAuthHeaders(options?.headers);
			return request<T>(endpoint, { ...options, headers, method: "GET" });
		},

		post: async <T>(
			endpoint: string,
			data: unknown,
			options?: RequestOptions
		) => {
			const headers = await createAuthHeaders(options?.headers);
			headers.append("Content-Type", "application/json");
			return request<T>(endpoint, {
				...options,
				headers,
				method: "POST",
				body: JSON.stringify(cleanObject(data)),
			});
		},

		put: async <T>(
			endpoint: string,
			data: unknown,
			options?: RequestOptions
		) => {
			const headers = await createAuthHeaders(options?.headers);
			headers.append("Content-Type", "application/json");
			return request<T>(endpoint, {
				...options,
				headers,
				method: "PUT",
				body: JSON.stringify(cleanObject(data)),
			});
		},

		delete: async <T>(endpoint: string, options?: RequestOptions) => {
			const headers = await createAuthHeaders(options?.headers);
			return request<T>(endpoint, { ...options, headers, method: "DELETE" });
		},
	},
};
