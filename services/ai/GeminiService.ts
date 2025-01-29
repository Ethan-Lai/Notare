import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { IAIService } from "./IAIService";

export class GeminiService implements IAIService {
    private model: GenerativeModel

    public constructor(apiKey: string, model: string) {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model });
    }

    async ask(question: string): Promise<{ message: string; }> {
        const prompt = `Format the response as human-readable HTML-safe content, without unnecessary characters like stars or double quotes. My question is: ${question}`
        const result = await this.model.generateContent(prompt);
        return { message: result.response.text() };
    }
}