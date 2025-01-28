import { IAIService } from "./IAIService";

type GeminiResponse = {
    candidates: [
        {
            content: {
                parts: [{ text: string }]
            }
        }
    ]
}

export class GeminiService implements IAIService {
    private apiKey: string;
    private endpoint: string;

    public constructor(apiKey: string, endpoint: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
    }

    async ask(question: string): Promise<{ message: string; }> {
        const url = `${this.endpoint}?key=${this.apiKey}`;
        const prompt = `Format the response as human-readable HTML-safe content, without unnecessary characters like stars or double quotes. My question is: ${question}`
        const res = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        // Verify request was successful
        if (res.status != 200) { throw Error("Error sending request to Gemini API"); }
        const body: GeminiResponse = await res.json();
        const message = this.#parseGeminiResponse(body);

        return Promise.resolve({ message });
    }

    /**
     * Parses the body of a successful response to the API and returns the output message.
     */
    #parseGeminiResponse(body: GeminiResponse): string {
        return body.candidates[0].content.parts[0].text;
    }
}