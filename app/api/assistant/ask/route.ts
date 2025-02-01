import { getAIService } from '@/services/ai/AIServiceFactory';
import { IAIService } from '@/services/ai/IAIService';
import {NextResponse} from "next/server";

/**
 * Handler for API route to ask the AI a general question without any context.
 */
export async function POST(req: Request) {
    const body = await req.json();
    const { question } = body;
    if (!question) {
        return NextResponse.json({ message: "A question must be provided" }, { status: 400 });
    }

    // Send question to AI service
    const service: IAIService = getAIService();
    try {
        const response = await service.ask(question);
        return NextResponse.json({ message: response }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Sorry, something went wrong." }, { status: 500 });
    }
}