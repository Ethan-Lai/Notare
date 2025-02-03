import { useState } from 'react';
import CreateNote from '../components/CreateNote';
import AskGemini from '../components/AskGemini';
import UploadNote from '../components/UploadNote';
import { useRouter } from 'next/router';

export default function Home() {
    const router = useRouter();

    // the note for CreateNote
    const [note, setNote] = useState({ title: '', content: '', tag: 0 });

    // the question states for the ask gemini part
    const [question, setQuestion] = useState('');
    const [prev_question, setPrevQuestion] = useState([]);
    const [prev_response, setPrevResponse] = useState([]);

    // function for handling uploads of notes
    const handleUploadNote = async (fileContent, title, tag, file) => {
        const newNote = { title, content: fileContent, tag };
        setNote(newNote); // update the contents of the note (for the text)

        try {
            // create form data for the API
            const formData = new FormData();
            formData.append("file", file);
            formData.append("title", title);
            formData.append("tag", tag);

            // send form data to ai endpoint
            const response = await fetch('/api/assistant/summary', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to generate response.');
            }

            // change the chat box
            const data = await response.json();
            setPrevQuestion([...prev_question, title]);
            setPrevResponse([...prev_response, data.message]);

        } catch (error) {
            console.error(error);
            alert('Error uploading file: ' + error.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userId');
        router.push('/login');
    };

    return (
        <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
            <h1>Notes App</h1>

            <div style={{ flex: '1' }}>
                <CreateNote note={note} setNote={setNote} />
            </div>

            <div style={{ flex: '1' }}>
                <h2>Ask Gemini</h2>
                <AskGemini
                    question={question}
                    setQuestion={setQuestion}
                    prev_question={prev_question}
                    prev_response={prev_response}
                    setPrevQuestion={setPrevQuestion}
                    setPrevResponse={setPrevResponse}
                />
            </div>

      <UploadNote onFileUpload={handleUploadNote} />
      <button onClick={handleLogout}>
            Logout
      </button>
    </div>
  );
}