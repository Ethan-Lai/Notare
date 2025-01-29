import { useState } from 'react';

export default function AskGemini() {
    const [question, setQuestion] = useState('');
    const [prev_question, setPrevQuestion] = useState('');
    const [response, setResponse] = useState('');

    const handleAskQuestion = (e) => {
        setQuestion(e.target.value);
    }

    const handlePrevQuestion = (e) => {
        setPrevQuestion(e.target.value);
    }

    const generateAnswer = async () => {
        try {
            const response = await fetch('/api/assistant/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: question })
            });
            
            const data = await response.json();
            setResponse(data.message);
            setPrevQuestion(question);
            setQuestion(''); // Clear the input after sending
        } catch (error) {
            console.error('Error:', error);
            setResponse('An error occurred while getting the response');
        }
    }

    return ( 
        <div> 
            {prev_question && ( // If there is a question
                <div style={{ textAlign: 'right', backgroundColor: 'darkblue' }}>{prev_question}</div>
            )}
            {response && ( // If there is a response
                <div dangerouslySetInnerHTML={{ __html: response }} /> // May need to check for security, but this is fine for now since gemini is responding in HTML
            )}
            
            <form 
                onSubmit={(e) => {
                    e.preventDefault();
                    generateAnswer();
                }}
                
            >
                <input 
                    type="text" 
                    value={question}
                    onChange={handleAskQuestion}
                    placeholder="Ask your question..."
                    style={{ flex: '1', gap: '4px' }}
                    
                />
                <button type="submit">
                    Ask
                </button>
            </form>
        </div>
    );
}