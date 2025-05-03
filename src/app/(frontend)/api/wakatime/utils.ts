import { NextResponse } from "next/server";

export async function fetchWakaTimeData(url: string) {
	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`Failed to fetch WakaTime data: ${response.statusText}`);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error) {
		console.error("Error fetching WakaTime data:", error);
		return NextResponse.json(
			{ error: "Failed to fetch WakaTime data" },
			{ status: 500 }
		);
	}
}
