import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { title, content, authorId } = req.body;

      // Ensure `authorId` is provided and is an integer
      if (!authorId || typeof authorId !== 'number') {
        return res.status(400).json({ error: 'Valid authorId (integer) is required' });
      }

      const newNote = await prisma.note.create({
        data: {
          title: title || 'Untitled Note',
          content: content || '',
          authorId,
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

