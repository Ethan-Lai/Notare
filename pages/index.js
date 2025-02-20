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
import {ActiveFileContext} from "../context/ActiveFileContext";
import Sidebar from '../components/Sidebar';

export default function Home() {
    const router = useRouter();

    // Active Note content
    const [activeFileContent, setActiveFileContent] = useState("");

    const [prev_question, setPrevQuestion] = useState([]);
    const [prev_response, setPrevResponse] = useState([]);

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

    return (
        <AppShell
            header={{ height: 70 }}
            aside={{ width: "25%" }}
            navbar={{ width: "15%" }}
            padding="md"
        >
            <Header/>
            <Aside/>
            <Sidebar/>

            <AppShellMain>
                <div style={{ display: 'flex', gap: '2rem', padding: '2rem' }}>

                    <div style={{ flex: '1' }}>
                        <CreateNote note={note} setNote={setNote} />
                    </div>

                    <UploadNote onFileUpload={handleUploadNote} />
                </div>
            </AppShellMain>
        </AppShell>
  );
}

