import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { title, content, authorId, tag } = req.body;

      if (!authorId) {
        return res.status(400).json({ error: 'Author ID is required' });
      }

      const newNote = await prisma.note.create({
        data: {
          title: title || 'Untitled Note',
          content: content || '',
          tag: tag || 0, // Default tag
          authorId,
          canDelete: false,
        },
      });

      res.status(201).json(newNote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create note', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

