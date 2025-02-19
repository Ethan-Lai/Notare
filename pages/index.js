import { useState, useEffect } from 'react';
import CreateNote from '../components/CreateNote';
import UploadNote from '../components/UploadNote';
import { useRouter } from 'next/router';
import {
    AppShell,
    AppShellMain,
} from "@mantine/core";
import Header from "../components/layout/Header";
import Aside from "../components/layout/Aside";

export default function Home() {
    const router = useRouter();

    // the note for CreateNote
    const [note, setNote] = useState({ title: '', content: '', tag: 0 });

    // state to hold all notes
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    // fetch all notes on page load
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const response = await fetch('/api/notes/getAll');
                const data = await response.json();
                setNotes(data);
            } catch (error) {
                console.error('Error fetching notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    // group notes by authorId
    const notesByAuthor = notes.reduce((acc, note) => {
        if (!acc[note.authorId]) {
            acc[note.authorId] = {
                author: note.author,
                notes: [],
            };
        }
        acc[note.authorId].notes.push(note);
        return acc;
    }, {});

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
        <AppShell
            header={{ height: 70 }}
            aside={{ width: "25%" }}
            padding="md"
        >
            <Header/>
            <Aside/>

            <AppShellMain>
                <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>
                    <h1>Notes App</h1>

                    <div style={{ flex: '1' }}>
                        <CreateNote note={note} setNote={setNote} />

                        // DISPAY ALL NOTES (WHOEVER IS DOING TICKET 26 LOOK HERE)
                        <div style={{ marginTop: '2rem' }}>
                            <h2>All Notes</h2>
                            {loading ? (
                                <p>Loading...</p>
                            ) : (
                                Object.keys(notesByAuthor).map((authorId) => (
                                    <div key={authorId} style={{ border: '1px solid black', padding: '10px', marginBottom: '10px' }}>
                                        <h3>Author: {notesByAuthor[authorId].author?.name || 'Unknown'} (ID: {authorId})</h3>
                                        <ul>
                                            {notesByAuthor[authorId].notes.map((note) => (
                                                <li key={note.id}>
                                                    <strong>{note.title}</strong> - {note.content} (Created: {new Date(note.createdAt).toLocaleString()})
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <UploadNote onFileUpload={handleUploadNote} />
                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </AppShellMain>
        </AppShell>
  );
}

