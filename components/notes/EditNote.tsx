import {Group, Select, Stack, Text, Textarea, TextInput, Button} from "@mantine/core";
import {useNotes} from "@/context/NotesContext";
import {useDebouncedValue} from "@mantine/hooks";
import {ChangeEvent, useEffect, useState} from "react";
import {IconRefresh, IconTrash, IconRobot} from "@tabler/icons-react";
import {notifications} from "@mantine/notifications";
import {useChat} from "@/context/ChatContext";

export interface EditNoteProps {
    note: Note;
}

export default function EditNote({ note }: EditNoteProps) {
    const { updateNoteLocally, updateNoteInDB, deleteNote, setActiveNoteId, closeNote, notes } = useNotes();
    const { history } = useChat();
    const [saving, setSaving] = useState(false);
    const [hasEdited, setHasEdited] = useState(false);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const TRASH_TAG = -1; 

    // Update note in DB automatically shortly after user has stopped typing
    const [debouncedTitle] = useDebouncedValue(note.title, 500);
    const [debouncedContent] = useDebouncedValue(note.content, 500);
    const [debouncedTag] = useDebouncedValue(note.tag, 500);

    // Get unique tags from all notes
    const availableTags = [...new Set(notes.map(n => n.tag))].sort((a, b) => a - b);

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

    const handleTagChange = (val: string | null) => {
        const newTag = val ? parseInt(val) : 0;
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
            // Get the most recent response from chat history (it's at index 0 since entries are prepended)
            const mostRecentEntry = history[0];
            if (!mostRecentEntry) {
                notifications.show({
                    color: 'yellow',
                    title: 'No Response Available',
                    message: 'Please ask a question first to get an AI response.',
                    position: 'top-right'
                });
                return;
            }

            // Get placement suggestion for the most recent response
            const placementRes = await fetch('/api/assistant/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: "Given this note content, suggest where to insert new content. Only respond with: 'start' or 'end'.",
                    context: note.content
                })
            });

            if (!placementRes.ok) {
                throw new Error('Failed to get AI placement suggestion');
            }

            const placementData = await placementRes.json();
            const placement = placementData.message.toLowerCase();

            // Insert just the raw response without any formatting
            let newContent;
            if (placement.includes('start')) {
                newContent = note.content ? `${mostRecentEntry.response}\n\n${note.content}` : mostRecentEntry.response;
            } else {
                newContent = note.content ? `${note.content}\n\n${mostRecentEntry.response}` : mostRecentEntry.response;
            }

            updateNoteLocally({ ...note, content: newContent });
            setHasEdited(true);

            notifications.show({
                color: 'green',
                title: 'Success',
                message: 'AI response has been inserted into your note.',
                position: 'top-right'
            });
        } catch (error) {
            console.error('Error inserting AI response:', error);
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'Failed to insert AI response.',
                position: 'top-right'
            });
        }
        setIsLoadingAI(false);
    };

    const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const droppedText = e.dataTransfer.getData("text/plain");
        if (!droppedText) return;

        setIsLoadingAI(true);
        try {
            // Get cursor position
            const textarea = e.currentTarget;
            const cursorPosition = textarea.selectionStart;
            const beforeCursor = note.content.substring(0, cursorPosition);
            const afterCursor = note.content.substring(cursorPosition);

            // Ask AI for placement suggestion around the cursor position
            const placementRes = await fetch('/api/assistant/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: "Given this note content and cursor position (marked by |), suggest the best way to insert new content. Only respond with: 'before-cursor' or 'after-cursor'.",
                    context: `${beforeCursor}|${afterCursor}`
                })
            });

            if (!placementRes.ok) {
                throw new Error('Failed to get AI placement suggestion');
            }

            const placementData = await placementRes.json();
            const placement = placementData.message.toLowerCase();

            // Insert the content based on AI suggestion
            let newContent;
            if (placement.includes('before')) {
                newContent = `${beforeCursor}\n${droppedText}\n${afterCursor}`;
            } else {
                newContent = `${beforeCursor}\n\n${droppedText}\n${afterCursor}`;
            }

            updateNoteLocally({ ...note, content: newContent });
            setHasEdited(true);

            notifications.show({
                color: 'green',
                title: 'Success',
                message: 'Content has been inserted into your note.',
                position: 'top-right'
            });
        } catch (error) {
            console.error('Error handling drop:', error);
            notifications.show({
                color: 'red',
                title: 'Error',
                message: 'Failed to insert content.',
                position: 'top-right'
            });
        }
        setIsLoadingAI(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    };

    return (
        <Stack p={0} gap={0} mt="sm">
            <Group justify="space-between">
                <Select
                    label="Tag"
                    placeholder="Select a tag"
                    value={note.tag.toString()}
                    onChange={handleTagChange}
                    data={availableTags.map(tag => ({ value: tag.toString(), label: `Tag ${tag}` }))}
                    maw={200}
                    size="xs"
                />

                <Group opacity={saving ? 1 : 0} style={{ transition: "opacity 0.2s" }}>
                    <IconRefresh size={16} />
                    <Text size="sm" c="dimmed">Saving...</Text>
                </Group>

                <Group>
                    {history.length > 0 && (
                        <Button
                            color="blue"
                            leftSection={<IconRobot size={16} />}
                            onClick={handleAIResponse}
                            loading={isLoadingAI}
                            mt="md"
                        >
                            Insert AI Response
                        </Button>
                    )}
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
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{ cursor: 'text' }}
            />
            
        </Stack>
    )
}