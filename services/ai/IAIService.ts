/**
 * Interface representing a service that can interact with an AI API.
 */
export interface IAIService {
    /**
     * Ask the AI a question and receive a response.
     * @param question question to ask
     * @throws if there is an issue with the request to the API
     * @returns response to question from AI
     */
    ask(question: string): Promise<string>

    /**
     * Have the AI generate notes from a given file.
     * @param file the file to generate notes from
     * @returns response from AI in an HTML-safe format
     */
    generateNotes(file: Blob): Promise<string>
}