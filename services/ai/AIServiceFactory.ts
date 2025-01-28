import { GeminiService } from "./GeminiService";
import { IAIService } from "./IAIService";

let instance: IAIService | null = null;

export function getAIService(): IAIService {
	if (!instance) {
		const apiKey = process.env.GEMINI_API_KEY || "";
		if (!apiKey) {
			console.error("AI API key is missing.");
		}

		const endpoint = process.env.GEMINI_API_ENDPOINT || "";
		if (!endpoint) {
			console.error("AI API endpoint is missing.")
		}

		instance = new GeminiService(apiKey, endpoint);
	}

	return instance;
}