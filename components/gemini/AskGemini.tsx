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
            const body = { question: question, context: activeNote?.content };
            const res = await fetch('/api/assistant/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                throw new Error(`Invalid response code: ${res.status}`);
            }

            const data = await res.json();
            const response = data.message;
            
            // Add to history
            addToHistory({ prompt: question, response: response });

            // Ask AI if this is a request to insert into note
            if (activeNote) {
                const insertCheckRes = await fetch('/api/assistant/ask', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        question: "Is the user asking to insert or add this response into their note? Only respond with 'yes' or 'no'.",
                        context: `User's question: ${question}\n\nAI Response: ${response}`
                    })
                });

                if (!insertCheckRes.ok) {
                    throw new Error('Failed to check if response should be inserted');
                }

                const insertCheckData = await insertCheckRes.json();
                const shouldInsert = insertCheckData.message.toLowerCase().includes('yes');

                if (shouldInsert) {
                    // Split the note content into lines
                    const lines = activeNote.content.split('\n');
                    let insertionIndex = -1;

                    // First, get context about the note content and the AI response
                    const contextRes = await fetch('/api/assistant/ask', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            question: "Given this note content and AI response, analyze where the response would fit best contextually. Consider the question that was asked and its relationship to the surrounding content. Only suggest placement after the most relevant question or section.",
                            context: `Note content:\n${activeNote.content}\n\nAI Response:\n${response}\n\nOriginal Question:\n${question}`
                        })
                    });

                    if (!contextRes.ok) {
                        throw new Error('Failed to get AI context analysis');
                    }

                    // Now go through each line and ask if the response should be inserted after it
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const placementRes = await fetch('/api/assistant/ask', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                question: "Given this line of text, the AI response, and the original question, should the response be inserted after this line? Only respond with 'yes' or 'no'. Consider the context and relevance to the original question.",
                                context: `Line: "${line}"\n\nAI Response:\n${response}\n\nOriginal Question:\n${question}`
                            })
                        });

                        if (!placementRes.ok) {
                            throw new Error('Failed to get AI placement suggestion');
                        }

                        const placementData = await placementRes.json();
                        if (placementData.message.toLowerCase().includes('yes')) {
                            insertionIndex = i;
                            break;
                        }
                    }

                    // If no specific insertion point was found, append to the end
                    if (insertionIndex === -1) {
                        insertionIndex = lines.length - 1;
                    }

                    // Insert the response at the determined position
                    const newContent = lines.slice(0, insertionIndex + 1).join('\n') + 
                                     '\n\n' + response + 
                                     '\n' + lines.slice(insertionIndex + 1).join('\n');

                    // Update the note
                    updateNoteLocally({ ...activeNote, content: newContent });

                    notifications.show({
                        color: 'green',
                        title: 'Success',
                        message: 'AI response has been inserted into your note.',
                        position: 'top-right'
                    });
                }
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
                                <Text>{entry.response}</Text>
                            </Blockquote>
                        </Stack>
                    ))}
                </Stack>
            </ScrollArea.Autosize>
        </Stack>
    )
}