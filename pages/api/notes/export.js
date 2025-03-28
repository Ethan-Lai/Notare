import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  // Ensure only POST requests are handled
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed' 
    });
  }

  try {
    // Validate input
    const { noteId, format = 'pdf' } = req.body;
    
    // Validate noteId
    if (!noteId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Note ID is required' 
      });
    }

    // Fetch note details from database
    const note = await prisma.note.findUnique({
      where: { id: noteId }
    });

    // Check if note exists
    if (!note) {
      return res.status(404).json({ 
        success: false, 
        message: 'Note not found' 
      });
    }

    let fileBase64, filename;

    // Generate file based on format
    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(note.title || 'Untitled Note', 10, 10);

      doc.setFontSize(12);
      doc.text(note.content || '', 10, 20);

      fileBase64 = doc.output('datauristring');
      filename = `${note.title || 'note'}.pdf`;
    } else if (format === 'txt') {
      const txtContent = `${note.title || 'Untitled Note'}\n\n${note.content || ''}`;
      fileBase64 = `data:text/plain;base64,${Buffer.from(txtContent, 'utf-8').toString('base64')}`;
      filename = `${note.title || 'note'}.txt`;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid format. Use "pdf" or "txt".' 
      });
    }

    // Return successful response
    res.status(200).json({ 
      success: true,
      file: fileBase64, 
      filename 
    });

  } catch (error) {
    console.error('Export Note Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error',
      error: error.message 
    });
  }
}
