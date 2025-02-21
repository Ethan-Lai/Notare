import { useState } from 'react';
import {AppShellNavbar, Divider, NavLink} from '@mantine/core';
import { useNotes } from '../context/NotesContext';
import {IconHome2} from "@tabler/icons-react";

export default function Sidebar() {
    const { notes } = useNotes();
    const [expandedTags, setExpandedTags] = useState({});
    const { activeNote, setActiveNote } = useNotes();

    // Sort notes by tag 
    const notesByTag = Object.groupBy(notes, note => note.tag);

    const toggleTag = (tag) => {
        setExpandedTags(prev => ({
            ...prev,
            [tag]: !prev[tag]
        }));
    };

    return (
        <AppShellNavbar p="md">
            <NavLink
                label="Home"
                key={"Home"}
                leftSection={<IconHome2 />}
                onClick={() => setActiveNote(null)}
                active={!activeNote}
            />
            <Divider mt="sm"/>

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
                            label={note.title ? note.title : "Untitled Note"}
                            variant="light"
                            onClick={() => setActiveNote(note)}
                            active={activeNote?.id === note.id}
                        />
                    ))}
                </NavLink>
            ))}
        </AppShellNavbar>
    );
}