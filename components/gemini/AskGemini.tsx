import {
    Blockquote,
    Divider,
    Paper, ScrollArea,
    Skeleton,
    Stack,
    Text,
    Textarea,
} from "@mantine/core";
import React, {FormEvent, useState} from "react";
import {notifications} from "@mantine/notifications";
import {useNotes} from "@/context/NotesContext";

type HistoryEntry = {
    prompt: string;
    response: string;
}

export default function AskGemini() {
    const [question, setQuestion] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState<HistoryEntry[]>([]); // Contains only answered questions

    // Access active note (if existing) to provide as context
    const { activeNote } = useNotes();

    const handleSubmit = async (e?: FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);

        try {
            const body = { question: question, context: activeNote.content };
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
            setHistory([
                { prompt: question, response: data.message },
                ...history
            ]);
            setQuestion("");

        } catch (err) {
            console.error(err);
            notifications.show({
                color: 'red',
                title: 'Error',
                message: "Sorry, something went wrong.",
                position: "top-right"
            });
        }

        setIsLoading(false);
    }

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            await handleSubmit(e);
        }
    }

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
                    placeholder="Ask Gemini"
                    aria-label="Ask Gemini"
                />
            </form>

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
                            <Paper shadow="xs" p="xs" key={index}>
                                <Text size="md" fw={300}>
                                    {entry.prompt}
                                </Text>
                            </Paper>
                            <Blockquote
                                style={{
                                    textAlign: 'left',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                <div dangerouslySetInnerHTML={{ __html: entry.response }} />
                            </Blockquote>
                        </Stack>
                    ))}
                </Stack>
            </ScrollArea.Autosize>
        </Stack>
    )
}