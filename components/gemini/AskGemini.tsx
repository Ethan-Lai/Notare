import {
    Blockquote,
    Button,
    Divider,
    Group,
    Paper, 
    ScrollArea,
    Skeleton,
    Stack,
    Text,
    Textarea,
} from "@mantine/core";
import React, {FormEvent, useState} from "react";
import {notifications} from "@mantine/notifications";
import {useNotes} from "@/context/NotesContext";
import {useChat} from "@/context/ChatContext";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

export default function AskGemini() {
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { history, addToHistory, clearHistory } = useChat();
    const { activeNote, updateNoteLocally } = useNotes();

    const handleSubmit = async (e?: FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);

        try {
            // Check if this is a request to insert into note
            const isInsertRequest = question.toLowerCase().includes('insert') && 
                                  question.toLowerCase().includes('note');

            const body = { question: question, context: activeNote?.content };
            const res = await fetch('/api/assistant/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain'
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                throw new Error(`Invalid response code: ${res.status}`);
            }

            const data = await res.json();
            const response = data.message.replace(/<[^>]*>/g, '');
            
            addToHistory({ prompt: question, response: response });

            if (isInsertRequest && activeNote) {
                // Get placement suggestion with more detailed analysis
                const placementRes = await fetch('/api/assistant/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        question: `Analyze this note content and determine where to insert new content. Find the most relevant position based on context and topic.
                        If you find a specific line that the new content should follow, respond with "after: " followed by that line.
                        If it should go at the start, respond with "start".
                        If it should go at the end, respond with "end".
                        Only respond with one of these formats, no explanation.
                        Note content: "${activeNote.content}"`,
                        context: response // Providing the response as context to help with placement
                    })
                });

                if (!placementRes.ok) {
                    throw new Error('Failed to get AI placement suggestion');
                }

                const placementData = await placementRes.json();
                const placement = placementData.message.toLowerCase();

                // Insert the response based on more specific placement
                let newContent = activeNote.content;
                if (placement === 'start') {
                    newContent = `${response}\n\n${activeNote.content}`;
                } else if (placement === 'end') {
                    newContent = `${activeNote.content}\n\n${response}`;
                } else if (placement.startsWith('after: ')) {
                    const targetLine = placement.substring(7);
                    const parts = activeNote.content.split('\n');
                    let insertIndex = -1;
                    
                    // Find the line that matches our target
                    for (let i = 0; i < parts.length; i++) {
                        if (parts[i].trim() === targetLine.trim()) {
                            insertIndex = i;
                            break;
                        }
                    }

                    if (insertIndex !== -1) {
                        // Insert after the found line
                        parts.splice(insertIndex + 1, 0, '\n' + response);
                        newContent = parts.join('\n');
                    } else {
                        // Fallback to end if line not found
                        newContent = `${activeNote.content}\n\n${response}`;
                    }
                } else {
                    // Fallback to end if format not recognized
                    newContent = `${activeNote.content}\n\n${response}`;
                }

                updateNoteLocally({ ...activeNote, content: newContent });

                notifications.show({
                    color: 'green',
                    title: 'Success',
                    message: 'AI response has been inserted into your note.',
                    position: 'top-right'
                });
            }

            setQuestion("");
        } catch (err) {
            console.error(err);
            notifications.show({
                color: 'red',
                title: 'Error',
                message: "Sorry, something went wrong.",
                position: 'top-right'
            });
        }

        setIsLoading(false);
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            await handleSubmit(e);
        }
    }

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, response: string) => {
        e.dataTransfer.setData("text/plain", response);
        e.dataTransfer.effectAllowed = "copy";
    };

    return (
        <Stack
            gap="sm"
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
            <form onSubmit={handleSubmit}>
                <Textarea
                    autosize
                    variant="filled"
                    size="md"
                    maxRows={4}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    placeholder={activeNote ? "Ask Gemini" : "Select a note to ask questions"}
                    aria-label="Ask Gemini"
                    disabled={!activeNote}
                />
                {!activeNote && (
                    <Text size="sm" c="dimmed" mt="xs">
                        Please select or create a note to start asking questions
                    </Text>
                )}
            </form>

            <Group justify="space-between">
                {history.length > 0 && (
                    <Button 
                        variant="subtle" 
                        color="gray" 
                        size="xs" 
                        onClick={clearHistory}
                    >
                        Clear History
                    </Button>
                )}
                <Text size="sm">
                    {history.length > 0 ? `${history.length} message${history.length > 1 ? 's' : ''}` : ''}
                </Text>
            </Group>

            <Divider />

            {isLoading ? <Skeleton height={36}></Skeleton> : null}

            <ScrollArea.Autosize
                mah="80vh"
                w="100%"
                type="hover"
                dir="column"
                mx="auto"
                style={{ flex: 1, minHeight: 0 }}
            >
                <Stack gap="sm">
                    {history.map((entry, index) => (
                        <Stack key={index}>
                            <Paper shadow="xs" p="xs">
                                <Text size="md" fw={300}>
                                    {entry.prompt}
                                </Text>
                            </Paper>
                            <Blockquote
                                draggable
                                onDragStart={(e) => handleDragStart(e, entry.response)}
                                style={{
                                    textAlign: 'left',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    overflowWrap: 'anywhere',
                                    cursor: 'grab',
                                    backgroundColor: 'var(--mantine-color-default-filled)',
                                    transition: 'background-color 0.2s',
                                    ':hover': {
                                        backgroundColor: 'var(--mantine-color-default-filled-hover)',
                                    }
                                }}
                            >
                                <Text style={{ whiteSpace: 'pre-wrap' }}>{entry.response}</Text>
                            </Blockquote>
                        </Stack>
                    ))}
                </Stack>
            </ScrollArea.Autosize>
        </Stack>
    )
}