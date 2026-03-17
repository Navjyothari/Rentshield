const exifr = require('exifr');

const analyzeEvidence = async (fileBuffer) => {
  try {
    const metadata = await exifr.parse(fileBuffer);

    let tamperScore = 0.0;
    let exifValid = false;

    if (metadata) {
      exifValid = true;

      if (!metadata.GPSLatitude || !metadata.DateTimeOriginal) {
        tamperScore += 0.2;
      }

      if (metadata.Software && /photoshop|gimp|lightroom|editor/i.test(metadata.Software)) {
        tamperScore += 0.4;
      }

      if (metadata.CreateDate && metadata.ModifyDate &&
          metadata.CreateDate.getTime() !== metadata.ModifyDate.getTime()) {
        tamperScore += 0.2;
      }

      if (metadata.DateTimeOriginal && metadata.DateTimeOriginal > new Date()) {
        tamperScore += 0.2;
      }

      if (tamperScore > 1.0) tamperScore = 1.0;
    } else {
      tamperScore = 0.5; // Penalty for missing metadata
    }

    return {
      exifValid,
      tamperScore,
      metadata: metadata || null,
    };
  } catch (error) {
    console.error('Evidence analysis error:', error);
    return {
      exifValid: false,
      tamperScore: 0.5,
      metadata: null,
    };
  }
};

module.exports = { analyzeEvidence };
