import {Badge, Card, Group, Stack, Text, Highlight} from "@mantine/core";
import {getRelativeTimeString} from "@/helpers/relativeTimeStr";
import {useNotes} from "@/context/NotesContext";

interface NotePreviewProps {
    note: Note;
    height: number;
    searchQuery?: string;
}

export default function NotePreview(props: NotePreviewProps) {
    const { note, height, searchQuery } = props;
    const { setActiveNote } = useNotes();

    // NOTE: Currently displays when it was created, should probably change this to when it was last edited later
    const timeString = getRelativeTimeString(new Date(note.createdAt), navigator.language);

    return (
        <Card shadow="sm" padding="md" withBorder h={height} style={{ cursor: "pointer" }} onClick={() => setActiveNote(note)}>
          <Stack gap={4} flex={1}>
            <Group justify="space-between">
              <Text size="md" fw={700}>
                <Highlight highlight={searchQuery || ""}>{note.title}</Highlight>
              </Text>
              <Badge>{note.tag}</Badge>
            </Group>
            <Text size="sm" c="dimmed" fw={500} lineClamp={4}>
              <Highlight highlight={searchQuery || ""}>{note.content}</Highlight>
            </Text>
          </Stack>
          <Card.Section inheritPadding mb={0}>
            <Text size="sm" c="dimmed" fw={400}>
              {timeString}
            </Text>
          </Card.Section>
        </Card>
      );
    }