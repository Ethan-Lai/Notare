/**
 * Interface representing a service that can interact with an AI API.
 */
export interface IAIService {
    /**
     * Ask the AI a question and receive a response.
     * @param question question to ask
     * @throws if there is an issue with the request to the API
     */
    ask(question: string): Promise<{ message: string }>
}