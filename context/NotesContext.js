import { createContext, useContext, useState, useEffect } from 'react';

const NotesContext = createContext();

export function NotesProvider({ children }) {
    const [notes, setNotes] = useState([]);

    const fetchNotes = async () => {
        try {
            const response = await fetch('/api/notes/getAll');
            const data = await response.json();
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    };

    const createNote = async (noteData) => {
        const response = await fetch('/api/notes/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData),
        });

        if (response.ok) {
            const newNote = await response.json();
            setNotes(prevNotes => [...prevNotes, newNote]);
            return newNote;
        }
        throw new Error('Failed to create note');
    };

    const updateNote = async (noteData) => {
        const response = await fetch('/api/notes/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(noteData),
        });

        if (response.ok) {
            const updatedNote = await response.json();
            setNotes(prevNotes =>
                prevNotes.map(note => 
                note.id === updatedNote.id ? updatedNote : note
                )
            );
            return updatedNote;
        }
        throw new Error('Failed to update note');
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    return (
        <NotesContext.Provider value={{ notes, createNote, updateNote, fetchNotes }}>
            {children}
        </NotesContext.Provider>
    );
}

export function useNotes() {
    const context = useContext(NotesContext);
        if (!context) {
            throw new Error('useNotes must be used within a NotesProvider');
        }
    return context;
}