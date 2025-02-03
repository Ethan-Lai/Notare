import { useState, useEffect } from 'react';
import {useRouter} from "next/router";

export default function CreateNote({ note, setNote }) {
  const router = useRouter();

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', tag: 0 }); 
  const [tagInput, setTagInput] = useState(0);

  useEffect(() => {
    // only update if there is actually new content
    if (note.content !== newNote.content) {
      setNewNote(prevNote => ({
        ...prevNote,            // retain old properties of note (like id)
        content: note.content,  // update the text
        title: note.title,      // update the title
      }));
    }
  }, [note]);

  const handleCreateNote = async () => {
    const userId = localStorage.getItem('userId');
    console.log('Retrieved userId from localStorage:', userId);
  
    if (!userId) {
      alert('Please log in to create notes');
      router.push('/login');  // Redirect to login if no user ID
      return;
    }
  
    const response = await fetch('/api/notes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '',
        content: '',
        tag: 0, // Default Tag
        authorId: parseInt(userId, 10),
      }),
    });
  
    if (response.ok) {
      const note = await response.json();
      console.log('Created note with authorId:', userId);
      setNewNote(note);
      setNotes([...notes, note]);
    } else {
      console.error('Failed to create note. Status:', response.status);
      alert('Failed to create note. Please try again.');
    }
  };

  const handleContentChange = (e) => {
    setNewNote({ ...newNote, content: e.target.value });
  };

  const handleTitleChange = (e) => {
    setNewNote({ ...newNote, title: e.target.value });
  };

  const handleTagChange = (e) => {
    const tagValue = parseInt(e.target.value, 10) || 0; 
    setNewNote({ ...newNote, tag: tagValue });
    setTagInput(tagValue);
  };

  const saveNote = async () => {
    if (!newNote || !newNote.id) {
 	return;
  }
   const response = await fetch('/api/notes/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        tag: newNote.tag,
      }),
    });

    if (response.ok) {
      const updatedNote = await response.json();
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      );
      alert('Note saved successfully!');
    } else {
      alert('Failed to save the note.');
    }
  };

  return (
    <div>
      <button onClick={handleCreateNote}>Create Note</button>
      {newNote && (
        <div>
          <h2>Editing Note</h2>
          <input
            type="text"
            value={newNote.title}
            onChange={handleTitleChange}
            placeholder="Enter note title"
          />
          <textarea
            value={newNote.content}
            onChange={handleContentChange}
            placeholder="Start writing your note here..."
            rows="10"
            cols="50"
          />
          <input
            type="number"
            value={tagInput}
            onChange={handleTagChange}
            placeholder="Enter tag (number)"
          />
          <button onClick={saveNote}>Save Note</button>
        </div>
      )}
      <div>
        <h2>All Notes</h2>
        {notes.map((note) => (
          <div key={note.id}>
            <h3>{note.title}</h3>
            <p>{note.content}</p>
            <p>Tag: {note.tag}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

