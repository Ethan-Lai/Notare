import {Group, NumberInput, Stack, Text, Textarea, TextInput, Button} from "@mantine/core";
import {useNotes} from "@/context/NotesContext";
import {useDebouncedValue} from "@mantine/hooks";
import {ChangeEvent, useEffect, useState} from "react";
import {IconRefresh, IconTrash, IconRobot} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";

export interface EditNoteProps {
    note: Note;
}

export default function EditNote({ note }: EditNoteProps) {
    const { updateNoteLocally, updateNoteInDB, deleteNote, setActiveNoteId, closeNote} = useNotes();
    const [saving, setSaving] = useState(false);
    const [hasEdited, setHasEdited] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const TRASH_TAG = -1; 

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

    const handleDeleteNote = async () => {
        
        try {
          // Mark the note for deletion
          
          if (note.canDelete === false){
            const markResponse = await fetch("/api/notes/markDeletion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ noteId: note.id, authorId: note.authorId }),
              });
        
              if (!markResponse.ok) {
                notifications.show({
                    color: "red",
                    title: "Deletion Error.",
                    message: "There was an issue moving your note to the trash.",
                    position: "top-center",
                });
                return;
              }
                const updatedNote = await markResponse.json();
                updateNoteLocally({ ...updatedNote, tag: TRASH_TAG});
                updateNoteInDB({ ...updatedNote, tag: TRASH_TAG});
              
            } else{
                const deleteResponse = await fetch("/api/notes/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ noteId: note.id, authorId: note.authorId }),
                });
            
                if (!deleteResponse.ok) {
                    notifications.show({
                        color: "red",
                        title: "Deletion Error.",
                        message: "There was an issue deleting your note.",
                        position: "top-center",
                    });
                }
            
                // Remove the note from the local state
                deleteNote(note.id);
            }
        
            notifications.show({
                color: "green",
                title: "Note Deleted.",
                message: "Your note has been successfully deleted.",
                position: "top-center",
            });
                
                closeNote(note.id);
            
        } catch (error) {
                console.error("Deletion Error:", error); // Log the error
                notifications.show({
                    color: "red",
                    title: "Deletion Error.",
                    message: "There was an issue deleting your note.",
                    position: "top-center",
                });
            }
      };
    
    const handleAIResponse = async () => {
        setIsLoadingAI(true);
        try {
            // Ask AI about where to insert the response
            const placementRes = await fetch('/api/assistant/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: "Given this note content, where should I insert your response? Please analyze the content structure and suggest the best position (start, end, or after a specific section). Only respond with the position, no explanation needed.",
                    context: note.content
                })
            });

            if (!placementRes.ok) {
                throw new Error('Failed to get AI placement suggestion');
            }

            const placementData = await placementRes.json();
            const placement = placementData.message.toLowerCase();

            // Get the actual AI response for the note content
            const responseRes = await fetch('/api/assistant/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: "Please analyze this note and provide relevant insights, suggestions, or additional information. Keep the response concise and focused.",
                    context: note.content
                })
            });

            if (!responseRes.ok) {
                throw new Error('Failed to get AI response');
            }

            const responseData = await responseRes.json();
            const aiResponse = responseData.message;

            // Determine where to insert the response
            let newContent = note.content;
            if (placement.includes('start')) {
                newContent = `AI Response:\n${aiResponse}\n\n${note.content}`;
            } else {
                newContent = `${note.content}\n\nAI Response:\n${aiResponse}`;
            }

            // Update the note with the new content
            updateNoteLocally({ ...note, content: newContent });
            setHasEdited(true);

            notifications.show({
                color: 'green',
                title: 'Success',
                message: 'AI response has been inserted into your note.',
                position: 'top-right'
            });
        } catch (error) {
            console.error('Error getting AI response:', error);
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'Failed to get AI response.',
                position: 'top-right'
            });
        }
        setIsLoadingAI(false);
    };

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

                <Group>
                    <Button
                        color="blue"
                        leftSection={<IconRobot size={16} />}
                        onClick={handleAIResponse}
                        loading={isLoadingAI}
                        mt="md"
                    >
                        Insert AI Response
                    </Button>
                    <Button
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={handleDeleteNote}
                        mt="md"
                    >
                        Delete Note
                    </Button>
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