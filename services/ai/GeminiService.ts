import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import { IAIService } from "./IAIService";

export class GeminiService implements IAIService {
    private model: GenerativeModel

    public constructor(apiKey: string, model: string) {
        const genAI = new GoogleGenerativeAI(apiKey);
        this.model = genAI.getGenerativeModel({ model });
    }

    async ask(question: string): Promise<string> {
        const prompt = `Format the response as human-readable HTML-safe content, without unnecessary characters like stars or double quotes. My question is: ${question}`
        const result = await this.model.generateContent(prompt);
        return result.response.text();
    }

    async generateNotes(file: Blob): Promise<string> {
        // Convert file to Base64 string
        const arrayBuffer = await file.arrayBuffer();
        const data = (Buffer.from(arrayBuffer)).toString("base64");

        // Send request to gemini
        const prompt = "Could you generate some brief notes from the given file? Format the response in a human-readable HTML-safe content, without unnecessary characters like stars or double quotes.";
        const imagePart = { inlineData: { data: data, mimeType: file.type } };
        const result = await this.model.generateContent([prompt, imagePart]);
        return result.response.text();
    }
}