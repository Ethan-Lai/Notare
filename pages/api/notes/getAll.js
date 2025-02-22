import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'Author ID is required' });
      }

      const notes = await prisma.note.findMany({
        where: {
          authorId: parseInt(userId)
        },
      });

      res.status(200).json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notes', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

