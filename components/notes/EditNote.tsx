import {Group, NumberInput, Stack, Text, Textarea, TextInput} from "@mantine/core";
import {useNotes} from "@/context/NotesContext";
import {useDebouncedValue} from "@mantine/hooks";
import {ChangeEvent, useEffect, useState} from "react";
import {IconRefresh} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";

export interface EditNoteProps {
    note: Note;
}

export default function EditNote({ note }: EditNoteProps) {
    const { updateNoteLocally, updateNoteInDB } = useNotes();
    const [saving, setSaving] = useState(false);
    const [hasEdited, setHasEdited] = useState(false);

    // Update note in DB automatically shortly after user has stopped typing
    const [debouncedTitle] = useDebouncedValue(note.title, 500);
    const [debouncedContent] = useDebouncedValue(note.content, 500);
    const [debouncedTag] = useDebouncedValue(note.tag, 500);

    useEffect(() => {
        // Prevent API update call on initial load
        console.log(hasEdited);
        if (!hasEdited) return;

        const updateNote = async () => {
            setSaving(true);
            try {
                await updateNoteInDB(note);
                // Temporary fake delay to ensure saving indicator is visible
                await new Promise(resolve => setTimeout(resolve, 150));
            } catch (error) {
                notifications.show({
                    color: 'red',
                    title: 'Saving Error.',
                    message: "There was an issue saving your changes.",
                    position: "top-center"
                })
            }
            setSaving(false);
        }

        updateNote();
    }, [debouncedTitle, debouncedContent, debouncedTag]);

    const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        updateNoteLocally({ ...note, title: e.target.value });
        setHasEdited(true);
    }

    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        updateNoteLocally({ ...note, content: e.target.value });
        setHasEdited(true);
    }

    const handleTagChange = (val: string | number) => {
        const newTag = typeof val === "number" ? val : (parseInt(val) || 0);
        updateNoteLocally({ ...note, tag: newTag });
        setHasEdited(true);
    }

    return (
        <Stack p={0} gap={0} mt="sm">
            <Group justify="space-between">
                <NumberInput
                    variant="filled"
                    value={note.tag}
                    onChange={handleTagChange}
                    allowNegative={false}
                    label="Tag"
                    placeholder="Tag Number"
                    allowDecimal={false}
                    maw={200}
                    size="xs"
                />

                <Group opacity={saving ? 1 : 0} style={{ transition: "opacity 0.2s" }}>
                    <IconRefresh size={16} />
                    <Text size="sm" c="dimmed">Saving...</Text>
                </Group>
            </Group>

            <TextInput
                value={note.title}
                onChange={handleTitleChange}
                placeholder="New Note"
                size="xl"
                variant="unstyled"
                fw={600}
            />

            <Textarea
                minRows={8}
                autosize
                value={note.content}
                onChange={handleContentChange}
                placeholder="Start writing your note here..."
                size="md"
                variant="unstyled"
            />
        </Stack>
    )
}