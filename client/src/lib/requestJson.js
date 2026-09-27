const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
	/\/+$/,
	"",
);

export async function requestJson(path, options = {}) {
	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
	});
	const data = await response.json();

	if (!response.ok) {
		throw new Error(
			data.error || "The game server could not complete that request.",
		);
	}

	return data;
}
