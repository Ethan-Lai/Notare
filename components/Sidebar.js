import { useState } from 'react';
import { AppShellNavbar, NavLink } from '@mantine/core';
import { useNotes } from '../context/NotesContext';

export default function Sidebar({ opened }) {
    const { notes } = useNotes();
    const [expandedTags, setExpandedTags] = useState({});

    // Sort notes by tag 
    const notesByTag = Object.groupBy(notes, note => note.tag);

    const toggleTag = (tag) => {
        setExpandedTags(prev => ({
            ...prev,
            [tag]: !prev[tag]
        }));
    };

    if (!opened) {
        return null;
    }

    return (
        <AppShellNavbar p="md">
            {Object.entries(notesByTag).map(([tag, tagNotes]) => (
                <NavLink
                    key={tag}
                    label={`Tag ${tag}`}
                    opened={expandedTags[tag]}
                    onClick={() => toggleTag(tag)}
                >
                    {tagNotes.map(note => (
                        <NavLink
                            key={note.id}
                            component="button"
                            label={note.title}
                            variant="light"
                        />
                    ))}
                </NavLink>
            ))}
        </AppShellNavbar>
    );
}