import {useEffect, useState} from "react";
import {SimpleGrid, Skeleton, Stack, Text} from "@mantine/core";
import NotePreview from "@/components/notes/NotePreview";
import {notifications} from "@mantine/notifications";

export default function NotesOverview() {
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState<Note[]>([]);

    // Sizing setup
    const height = 180;

    // TODO: Remove this since NotesContext already fetches it?
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const res = await fetch('/api/notes/getAll');
                if (!res.ok) { throw new Error('Error fetching notes.'); }
                const data = await res.json();
                setNotes(data);
            } catch (error) {
                console.error(error);
                notifications.show({
                    color: 'red',
                    title: 'Failed to fetch data',
                    message: "There was an issue while fetching your data..",
                    position: "top-center"
                })
            }

            setLoading(false);
        }

        fetchNotes();
    }, []);

    return (
        <Stack>
            <SimpleGrid
                cols={{ base: 1, sm: 1, md: 2, lg: 3 }}
            >
                {loading && Array(9)
                    .fill(0)
                    .map((_, index) => (
                        <Skeleton key={index} h={height} animate={true} />
                    ))
                }

                {notes.map((note) => (
                    <NotePreview note={note} height={height} key={note.id} />
                ))}
            </SimpleGrid>

            {/* TODO: Update empty view */}
            {(!loading && notes.length == 0) && (
                <Text size="lg" fw={600}>
                    No Notes Found.
                </Text>
            )}
        </Stack>
    )
}