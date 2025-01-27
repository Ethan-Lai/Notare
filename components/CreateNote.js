import { useState } from 'react';

export default function CreateNote() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState(null);

  const handleCreateNote = async () => {
    const response = await fetch('/api/notes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '',
        content: '',
        authorId: 1, // Replace this with a valid integer `authorId` from your database
      }),
    });

    const note = await response.json();
    setNewNote(note);
    setNotes([...notes, note]);
  };

  const handleContentChange = (e) => {
    setNewNote({ ...newNote, content: e.target.value });
  };

  const saveNote = async () => {
    // Add logic to save updated content back to the database
    console.log('Saving note:', newNote);
  };

  return (
    <div>
      <button onClick={handleCreateNote}>Create Note</button>

      {newNote && (
        <div>
          <h2>Editing Note</h2>
          <textarea
            value={newNote.content}
            onChange={handleContentChange}
            placeholder="Start writing your note here..."
            rows="10"
            cols="50"
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
          </div>
        ))}
      </div>
    </div>
  );
}

