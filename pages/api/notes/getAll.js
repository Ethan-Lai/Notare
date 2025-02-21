import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const notes = await prisma.note.findMany({
        include: {
          author: {
            select: { id: true, name: true, email: true }, // fetch author details
          },
        },
        orderBy: [
          {authorId: 'asc' },
          {createdAt: 'desc' }
        ], // order notes by authorId
      });

      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

