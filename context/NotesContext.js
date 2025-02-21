import { createContext, useContext, useState, useEffect } from 'react';

const NotesContext = createContext();

export function NotesProvider({ children }) {
    const [notes, setNotes] = useState([]);
    const [initialLoad, setInitialLoad] = useState(true);
    const [activeNote, setActiveNote] = useState(null);

    const fetchNotes = async () => {
        try {
            const response = await fetch('/api/notes/getAll');
            const data = await response.json();
            await new Promise(resolve => setTimeout(resolve, 1500));
            setNotes(data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
        setInitialLoad(false)
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
            setNotes(prevNotes => [ newNote, ...prevNotes]);
            return newNote;
        }
        throw new Error('Failed to create note');
    };

    // Declare one update function for automatic in-memory updates, and the other for persisting changes to DB
    const updateNoteLocally = (noteData) => {
        setNotes(prevNotes => notes.map((note) =>
            note.id === noteData.id ? noteData : note
        ));

        if (activeNote && activeNote.id === noteData.id) {
            setActiveNote(noteData);
        }
    }

    /* Update note in DB - Call periodically to persist changes */
    const updateNoteInDB = async (noteData) => {
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
    }, [])

    return (
        <NotesContext.Provider value={{
            initialLoad,
            notes,
            createNote,
            updateNoteLocally,
            updateNoteInDB,
            fetchNotes,
            activeNote,
            setActiveNote
        }}>
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