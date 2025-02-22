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

      if (note.canDelete === false) {
        return res.status(401).json({ error: 'Note is not currently deletable' });
      }

      // delete it
      const deleteUser = await prisma.note.delete({
        where: { id: noteId , canDelete: true },
      });

      res.status(200).json(deleteUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
