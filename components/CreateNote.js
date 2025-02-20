import { useState, useEffect } from 'react';
import {useRouter} from "next/router";
import { useNotes } from '../context/NotesContext';

export default function CreateNote({ note, setNote }) {
  const router = useRouter();

  const { createNote, updateNote } = useNotes()
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

    try {
      const createdNote = await createNote({
        title: '',
        content: '',
        tag: tagInput,
        authorId: parseInt(userId, 10),
      });
      setNewNote(createdNote);
    } catch (error) {
      console.error('Failed to create note:', error);
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

    try {
      await updateNote({
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        tag: newNote.tag,
      });
      alert('Note saved successfully!');
    } catch {
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
    </div>
  );
}

