import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Ensure temp directory exists
const TEMP_EXPORT_DIR = path.join(process.cwd(), 'public', 'exports');
if (!fs.existsSync(TEMP_EXPORT_DIR)) {
  fs.mkdirSync(TEMP_EXPORT_DIR, { recursive: true });
}

// Preload fonts to avoid dynamic imports
const fontCache = {
  'schinese': () => import("./fonts/NotoSerifCJKsc-VF-normal.js"),
  'latin': () => import("./fonts/arial-unicode-ms-normal.js"),
  'hebrew': () => import("./fonts/NotoSerifHebrew-Regular-normal.js"),
  'arabic': () => import("./fonts/NotoSansArabic-Regular-normal.js"),
  'thai': () => import("./fonts/NotoSerifThai-Regular-normal.js"),
  'devanagari': () => import("./fonts/NotoSerifDevanagari-Regular-normal.js"),
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { noteId, format = 'pdf', margin = { top: 20, bottom: 20, left: 20, right: 20 }, alphabet} = req.body;
    
    if (!noteId) {
      return res.status(400).json({ success: false, message: 'Note ID is required' });
    }

    const note = await prisma.note.findUnique({ where: { id: noteId } });
    
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    if (format === 'pdf') {
      // Preload font if needed
      if (fontCache[alphabet]) {
        await fontCache[alphabet]();
      }

      const doc = new jsPDF();
      
      // Optimize font selection
      const fontMap = {
        'latin': ['arial-unicode-ms', 'normal'],
        'schinese': ['NotoSerifCJKsc-VF', 'normal'],
        'hebrew': ['NotoSerifHebrew-Regular', 'normal'],
        'arabic': ['NotoSansArabic-Regular', 'normal'],
        'thai': ['NotoSerifThai-Regular', 'normal'],
        'devanagari': ['NotoSerifDevanagari-Regular', 'normal'],
      };

      const [font, style] = fontMap[alphabet] || ['times', 'normal'];
      doc.setFont(font, style);
      doc.setFontSize(16);

      // Truncate very long titles
      const safeTitle = (note.title || 'Untitled Note').substring(0 , 100);
      doc.text(safeTitle, margin.left, margin.top);

      doc.setFontSize(12);
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = pageWidth - 2 * margin.left;
      
      // Limit content length to prevent performance issues
      const safeContent = (note.content || '').substring(0, 5000);
      const textLines = doc.splitTextToSize(safeContent, textWidth);
      doc.text(textLines, margin.left, margin.top + 10);

      // Generate unique filename
      const filename = `note_${noteId}_${Date.now()}.pdf`.replace(/[^a-zA-Z0-9.-_]/g, '_');
      const filePath = path.join(TEMP_EXPORT_DIR, filename);

      // Convert ArrayBuffer to Buffer
      const pdfArrayBuffer = doc.output('arraybuffer');
      const pdfBuffer = Buffer.from(new Uint8Array(pdfArrayBuffer));

      // Save PDF to file
      fs.writeFileSync(filePath, pdfBuffer);

      // Return download URL
      return res.status(200).json({ 
        success: true, 
        downloadUrl: `/exports/${filename}`,
        filename: filename
      });
    }

    return res.status(400).json({ success: false, message: 'Unsupported format' });
  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({ success: false, message: 'Export failed', details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
