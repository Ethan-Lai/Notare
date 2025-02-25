import {Badge, Card, Group, Stack, Text} from "@mantine/core";
import {getRelativeTimeString} from "@/helpers/relativeTimeStr";
import {useNotes} from "@/context/NotesContext";

interface NotePreviewProps {
    note: Note;
    height: number;
}

export default function NotePreview(props: NotePreviewProps) {
    const { note, height } = props;
    const { setActiveNoteId } = useNotes();

    // NOTE: Currently displays when it was created, should probably change this to when it was last edited later
    const timeString = getRelativeTimeString(new Date(note.createdAt), navigator.language);

    return (
        <Card
            shadow="sm"
            padding="md"
            withBorder
            h={height}
            style={{ cursor: "pointer" }}
            onClick={() => setActiveNoteId(note)}
        >
            <Stack gap={4} flex={1}>
                <Group justify="space-between">
                    <Text size="md" fw={700}>{note.title}</Text>
                    <Badge>{note.tag}</Badge>
                </Group>

                <Text size="sm" c="dimmed" fw={500} lineClamp={4}>
                    {note.content}
                </Text>
            </Stack>

            <Card.Section inheritPadding mb={0}>
                <Text size="sm" c="dimmed" fw={400}>
                    {timeString}
                </Text>
            </Card.Section>
        </Card>
    )
}