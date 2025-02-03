import { useState } from 'react';
import {useRouter} from "next/router";

export default function UploadNote({ onFileUpload }) {
    const router = useRouter();

    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [tag, setTag] = useState(0);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Please log in to upload notes');
            router.push('/login');  // Redirect to login if no user ID
            return;
        }

        const fileContent = await file.text();

        // after uploading the file, change the text and send the ai request
        onFileUpload(fileContent, title || file.name, tag, file);

        const response = await fetch('/api/notes/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title || file.name,
                content: fileContent,
                tag: tag,
                authorId: parseInt(userId, 10),
            }),
        });

        if (response.ok) {
            const note = await response.json();
            alert('Note uploaded successfully!');
            // Clear form
            setFile(null);
            setTitle('');
            setTag(0);
        } else {
            console.error('Failed to upload note. Status:', response.status);
            alert('Failed to upload note. Please try again.');
        }
    };

    return (
        <div>
            <h2>Upload Note from File</h2>
            <div>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title"
                />
                <input
                    type="number"
                    value={tag}
                    onChange={(e) => setTag(parseInt(e.target.value, 10) || 0)}
                    placeholder="Enter tag (number)"
                />
                <input
                    type="file"
                    accept=".txt,.pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                />
                <button onClick={handleUpload}>Upload Note</button>
            </div>
        </div>
    );
}