import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { noteId, authorId } = req.body;

      // need a note to delete and a user making tbe request
      if (!noteId || !authorId) {
        return res.status(400).json({ error: 'Note ID and Author ID are required' });
      }

      const note = await prisma.note.findUnique({
        where: { id: noteId },
      });

      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      if (note.authorId !== authorId) {
        return res.status(401).json({ error: 'Wrong user' });
      }

      // mark it for deletion
      const updatedNote = await prisma.note.update({
        where: { id: noteId },
        data: { canDelete: true },
      });

      res.status(200).json(updatedNote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark for deletion', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
