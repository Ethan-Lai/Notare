import { PrismaClient } from '@prisma/client';
import withAuth from "../../../lib/withAuth";

const prisma = new PrismaClient();

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { title, content, tag } = req.body;
      const authorId = req.userId;

      const newNote = await prisma.note.create({
        data: {
          title: title || 'Untitled Note',
          content: content || '',
          tag: tag || 0, // Default tag
          authorId: authorId, // Default author
          canDelete: false,
        },
      });

      res.status(201).json(newNote);
    } catch (error) {
      console.error('Error creating note:', error);
      res.status(500).json({ error: 'Failed to create note', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAuth(handler);
