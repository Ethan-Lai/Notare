import { useState } from 'react';

export default function UploadNote() {
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
      console.log('Uploaded note with authorId:', userId);
      alert('Note uploaded successfully!');
      setFile(null);
      setTitle('');
      setTag(0);
    } else {
      console.error('Failed to upload note. Status:', response.status);
      alert('Failed to upload note. Please try again.');
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleTagChange = (e) => {
    const tagValue = parseInt(e.target.value, 10) || 0; 
    setTag(tagValue);
  };

  return (
    <div>
      <h2>Upload Note from File</h2>
      <div>
        <input
            type="text"
            value={title}
            onChange={handleTitleChange}
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
            accept=".txt"
            onChange={handleFileChange}
        />
        <button 
            onClick={handleUpload}
            disabled={!file}
        >
            Upload Note
        </button>
      </div>
    </div>
  );
}