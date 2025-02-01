import { useState } from 'react';

export default function AskGemini() {
    const [question, setQuestion] = useState('');
    const [prev_question, setPrevQuestion] = useState([]);
    const [prev_response, setPrevResponse] = useState([]);

    const handleAskQuestion = (e) => {
        setQuestion(e.target.value);
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
            setPrevQuestion([...prev_question, question]);
            setPrevResponse([...prev_response, data.message]);
            
            setQuestion(''); // Clear the input after sending
        } catch (error) {
            console.error('Error:', error);
            setResponse('An error occurred while getting the response');
        }
    }

    return ( 
        <div> 
            {prev_question.map((q, index) => (
                <div key={index}>
                    <div style={{ textAlign: 'right', backgroundColor: 'darkblue', color: 'white', padding: '8px', margin: '4px', borderRadius: '8px' }}>
                        {q}
                    </div>
                    {prev_response[index] && (
                        <div style={{ textAlign: 'left', backgroundColor: 'black', color: 'white', padding: '8px', margin: '4px', borderRadius: '8px' }}>
                            <div dangerouslySetInnerHTML={{ __html: prev_response[index] }} />
                        </div>
                    )}
                </div>
            ))}
            
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