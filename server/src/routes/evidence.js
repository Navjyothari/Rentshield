const express = require('express');
const { prisma } = require('../lib/prisma');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const { upload } = require('../middleware/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../lib/cloudinary');
const { analyzeEvidence } = require('../services/evidenceService');
const { getIo } = require('../socket');

const router = express.Router();

router.post('/upload/:issueId', verifyToken, requireRole('tenant'), upload.single('file'), async (req, res, next) => {
  try {
    const { issueId } = req.params;
    
    // Verify issue exists and belongs to user (or is anonymous but user generated it - simplified check)
    const issue = await prisma.issue.findUnique({ where: { id: issueId } });
    if (!issue) return res.status(404).json({ message: 'Issue not found' });
    
    if (!req.file) return res.status(400).json({ message: 'No file provided' });

    // 1. Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    
    // 2. EXIF analysis
    const analysis = await analyzeEvidence(req.file.buffer);

    // 3. Save to DB
    const evidence = await prisma.evidence.create({
      data: {
        issueId,
        fileUrl: result.secure_url,
        fileType: req.file.mimetype,
        exifValid: analysis.exifValid,
        tamperScore: analysis.tamperScore,
        metadata: analysis.metadata || {},
      }
    });

    getIo().emit('evidence:analyzed', { evidenceId: evidence.id, tamperScore: analysis.tamperScore });

    res.status(201).json(evidence);
  } catch (error) {
    next(error);
  }
});

router.get('/:issueId', verifyToken, async (req, res, next) => {
  try {
    const evidence = await prisma.evidence.findMany({
      where: { issueId: req.params.issueId },
      orderBy: { uploadedAt: 'desc' }
    });
    res.json(evidence);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const evidence = await prisma.evidence.findUnique({ where: { id: req.params.id } });
    if (!evidence) return res.status(404).json({ message: 'Evidence not found' });

    // Try deleting from cloudinary (assuming filename is extractable from URL, simplified)
    const urlParts = evidence.fileUrl.split('/');
    const publicId = urlParts[urlParts.length - 1].split('.')[0];
    try { await deleteFromCloudinary(`rentshield/${publicId}`); } catch(e) { console.warn('Cloudinary delete failed', e); }

    await prisma.evidence.delete({ where: { id: req.params.id } });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
