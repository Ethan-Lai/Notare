import { PrismaClient } from '@prisma/client';
import withAuth from "../../../lib/withAuth";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Increase the size limit to 10MB (adjust as needed)
    },
  },
};

const prisma = new PrismaClient();

async function handler(req, res) {
  if (req.method === 'PUT') {
    try {
      // NOTE: Need to check whether user owns note
      const { id, title, content, tag, format, alphabet, margins } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Note ID is required' });
      }

      const updatedNote = await prisma.note.update({
        where: { id },
        data: { title, content, tag, format, alphabet, margins },
      });

      res.status(200).json(updatedNote);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update note', details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export default withAuth(handler);
