import { useState } from 'react';
import {
    AppShell,
    AppShellMain,
} from "@mantine/core";
import Header from "../components/layout/Header";
import Aside from "../components/layout/Aside";
import Sidebar from '../components/Sidebar';
import Home from "../components/Home";

export default function Index() {
    const [prev_question, setPrevQuestion] = useState([]);
    const [prev_response, setPrevResponse] = useState([]);

    // TODO: Move to sidebar
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
                <Home />
            </AppShellMain>
        </AppShell>
  );
}

