import { SimpleGrid, Skeleton, Stack, Text, Autocomplete } from "@mantine/core";
import NotePreview from "@/components/notes/NotePreview";
import { useNotes } from "@/context/NotesContext";
import { useState } from "react";

export default function NotesOverview() {
  const { notes, initialLoad }: { notes: Note[]; initialLoad: boolean } = useNotes();
  const [searchQuery, setSearchQuery] = useState("");

  // Sizing setup
  const height = 180;

  // Filter notes based on search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get suggestions for Autocomplete
  const suggestions = notes
    .map((note) => note.title)
    .filter((title) => title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <Stack>
      {/* Search Bar with Autocomplete */}
      <Autocomplete
        placeholder="Search notes..."
        value={searchQuery}
        onChange={setSearchQuery}
        data={suggestions}
      />

      <SimpleGrid cols={{ base: 1, sm: 1, md: 2, lg: 3 }}>
        {initialLoad &&
          Array(6)
            .fill(0)
            .map((_, index) => (
              <Skeleton key={index} h={height} animate={true} />
            ))}

        {Array.isArray(filteredNotes) &&
          filteredNotes.map((note) => (
            <NotePreview
              note={note}
              height={height}
              key={note.id}
              searchQuery={searchQuery}
            />
          ))}
      </SimpleGrid>

      {/* Empty State */}
      {!initialLoad && filteredNotes.length === 0 && (
        <Text size="lg" fw={600}>
          No Notes Found.
        </Text>
      )}
    </Stack>
  );
}