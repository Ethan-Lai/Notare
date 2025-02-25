import { useState } from 'react';
import {AppShellNavbar, Button, Divider, NavLink, Skeleton} from '@mantine/core';
import { useNotes } from '../context/NotesContext';
import {IconHome2, IconPlus} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";

export default function Sidebar({ opened }) {
    const [expandedTags, setExpandedTags] = useState({});
    const { notes, activeNote, createNote, setActiveNoteId, initialLoad } = useNotes();

    // Sort notes by tag 
    const notesByTag = notes?.length > 0 ? Object.groupBy(notes, note => note.tag) : {};

    const toggleTag = (tag) => {
        setExpandedTags(prev => ({
            ...prev,
            [tag]: !prev[tag]
        }));
    };

    const createNewNote = async () => {
        // Verify user is logged in
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('Please log in to create notes');
            router.push('/login');  // Redirect to login if no user ID
            return;
        }

        // Make API call to create empty note
        try {
            const createdNote = await createNote({
                title: '',
                content: '',
                tag: 0,
                authorId: parseInt(userId, 10),
                canDelete: false
            });
            setActiveNoteId(createdNote);
        } catch (error) {
            console.error(error);
            notifications.show({
                color: 'red',
                title: 'Error',
                message: "Sorry, there was an issue creating your note.",
                position: "top-center"
            })
        }
    }

    if (!opened) {
        return null;
    }

    return (
        <AppShellNavbar p="md">
            <Button
                size="sm"
                variant="filled"
                color="blue"
                leftSection={<IconPlus size={16} />}
                mb="md"
                onClick={createNewNote}
            >
                New Note
            </Button>

            <NavLink
                label="Home"
                key={"Home"}
                leftSection={<IconHome2 />}
                onClick={() => setActiveNoteId(null)}
                active={!activeNote}
            />
            <Divider mt="sm"/>

            {initialLoad ? (
                Array(8)
                    .fill(0)
                    .map((_, index) => (
                        <Skeleton key={index} h={32} mt="sm" animate={true} />
                    ))
            ): (
                Object.entries(notesByTag).map(([tag, tagNotes]) => (
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
                                onClick={() => setActiveNoteId(note)}
                                active={activeNote?.id === note.id}
                            />
                        ))}
                    </NavLink>
                ))
            )}
        </AppShellNavbar>
    );
}