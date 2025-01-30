import { getAIService } from '@/services/ai/AIServiceFactory';
import { IAIService } from '@/services/ai/IAIService';
import type { NextApiRequest, NextApiResponse } from 'next'
 
type ResponseData = {
  message: string
}

/**
 * Handler for API route to ask the AI a general question without any context.
 */
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
  ) {
    if (req.method != "POST") {
        return res.status(405).json({ message: "Method not allowed." });
    }

    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ message: "A question must be provided." });
    }

    // Send question to AI service
    const service: IAIService = getAIService();
    try {
        const response = await service.ask(question);
        return res.status(200).json(response);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Sorry, something went wrong." });
    }
}