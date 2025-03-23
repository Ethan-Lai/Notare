import { PrismaClient } from '@prisma/client';
import withAuth from "../../../lib/withAuth";

const prisma = new PrismaClient();

async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Extract userId from session and fetch notes
      const userId = req.userId;
      const notes = await prisma.note.findMany({
        where: {
          authorId: userId
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

export default withAuth(handler);