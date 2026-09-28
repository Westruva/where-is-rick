const configuredApiUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
const API_BASE_URL = (
	configuredApiUrl && !/^https?:\/\//i.test(configuredApiUrl)
		? `https://${configuredApiUrl}`
		: configuredApiUrl
)
	.replace(/\/+$/, "")
	.replace(/\/api$/i, "");

export async function requestJson(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	});
	const contentType = response.headers.get("content-type") || "";
	if (!contentType.includes("application/json")) {
		throw new Error(
			`The game API returned a non-JSON response (${response.status}). Check VITE_API_BASE_URL.`,
		);
	}
	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.error || "The game server could not complete that request.",
		);
	}

	return data;
}
