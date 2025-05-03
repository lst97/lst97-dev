/**
 * Validates if a string is a valid UUID v4.
 * @param value The string to validate
 * @returns boolean indicating if the string is a valid UUID v4
 */
export function validateUuid(value: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(value);
}

/**
 * Generates a temporary ID string prefixed with "temp_".
 * The ID consists of 9 random alphanumeric characters.
 *
 * @returns {string} A temporary ID string.
 */
export function generateTempId(): string {
	let result = "temp_";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < 9; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

/**
 * Constructs a query string from an object of parameters.
 * Filters out any parameters that are undefined, null, or empty strings.
 * Encodes the parameters for safe inclusion in a URL.
 *
 * @param params - An object containing key-value pairs to be converted into a query string.
 * @returns A query string prefixed with '?' if there are valid parameters, or an empty string if none.
 */
export function buildQueryString(params: Record<string, any>): string {
	const validParams = Object.entries(params)
		.filter(
			([_, value]) => value !== undefined && value !== null && value !== ""
		)
		.map(([key, value]) => {
			if (Array.isArray(value)) {
				return value.map((v) => `${key}=${encodeURIComponent(v)}`).join("&");
			}
			return `${key}=${encodeURIComponent(value)}`;
		})
		.join("&");

	return validParams ? `?${validParams}` : "";
}

/**
 * Cleans an object by removing properties that are null or empty strings.
 * If the input is an array, it is returned as is. Nested objects are also cleaned recursively.
 *
 * @param obj - The object to be cleaned.
 * @returns A new object with null and empty string properties removed.
 */
export function cleanObject(obj: any): any {
	if (typeof obj === "object" && obj !== null) {
		if (Array.isArray(obj)) {
			return obj; // Leave arrays as is
		}
		const cleanedEntries = Object.entries(obj)
			.filter(
				([_, value]) =>
					value !== null &&
					(typeof value !== "string" || value.trim() !== "") &&
					value !== undefined
			)
			.map(([key, value]) => {
				if (
					typeof value === "object" &&
					value !== null &&
					value !== undefined
				) {
					const cleanedValue = cleanObject(value);
					return [key, cleanedValue];
				}
				return [key, value];
			});
		return Object.fromEntries(cleanedEntries);
	}
	return obj;
}
