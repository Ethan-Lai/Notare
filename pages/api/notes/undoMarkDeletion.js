import { PrismaClient } from '@prisma/client';
import withAuth from "../../../lib/withAuth";

const prisma = new PrismaClient();

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { noteId, newTag } = req.body;
      const authorId = req.userId;

      // need a note to delete and a user making tbe request
      if (!noteId || !authorId) {
        return res.status(400).json({ error: 'Note ID and Author ID are required' });
      }
      if (newTag === undefined || typeof newTag !== 'number') {
        return res.status(400).json({ message: 'Invalid tag' });
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
        data: { canDelete: false, tag: newTag },
      });

      res.status(200).json(updatedNote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to undo mark for deletion', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAuth(handler);