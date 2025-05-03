import { fetchWakaTimeData } from "../utils";

export async function GET() {
	return fetchWakaTimeData(
		"https://wakatime.com/share/@lst97/40d4525f-2e29-4b9e-8855-1b97d980692d.json"
	);
}
