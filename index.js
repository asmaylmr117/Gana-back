const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Get all surah names
app.get('/api/surahs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM surahs ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get data for a specific surah
app.get('/api/surahs/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const surahResult = await pool.query('SELECT * FROM surahs WHERE id = $1', [id]);
    const pdfResult = await pool.query('SELECT pdf_url FROM surah_pdfs WHERE surah_id = $1', [id]);
    const audioResult = await pool.query('SELECT audio_url FROM surah_audio WHERE surah_id = $1', [id]);
    
    if (surahResult.rows.length === 0) {
      return res.status(404).json({ error: 'Surah not found' });
    }
    
    res.json({
      name: surahResult.rows[0].name,
      pdfs: pdfResult.rows.map(row => row.pdf_url),
      audio: audioResult.rows.map(row => row.audio_url)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== AZKAR ENDPOINTS =====

// Get all azkar sections
app.get('/api/azkar/sections', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM azkar_sections ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching azkar sections:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get azkar for a specific section
app.get('/api/azkar/:sectionId', async (req, res) => {
  const { sectionId } = req.params;
  try {
    // التحقق من وجود القسم
    const sectionResult = await pool.query('SELECT * FROM azkar_sections WHERE id = $1', [sectionId]);
    
    if (sectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Azkar section not found' });
    }
    
    // جلب الأذكار الخاصة بالقسم
    const azkarResult = await pool.query(
      'SELECT azkar_id as id, text, description FROM azkar WHERE section_id = $1 ORDER BY azkar_id',
      [sectionId]
    );
    
    res.json({
      section: sectionResult.rows[0],
      azkar: azkarResult.rows
    });
  } catch (err) {
    console.error('Error fetching azkar:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all azkar data (sections with their azkar)
app.get('/api/azkar', async (req, res) => {
  try {
    // جلب جميع الأقسام
    const sectionsResult = await pool.query('SELECT * FROM azkar_sections ORDER BY id');
    
    // جلب جميع الأذكار
    const azkarResult = await pool.query('SELECT * FROM azkar ORDER BY section_id, azkar_id');
    
    // تنظيم البيانات
    const azkarData = {};
    const sections = sectionsResult.rows;
    
    // تجميع الأذكار حسب القسم
    azkarResult.rows.forEach(azkar => {
      if (!azkarData[azkar.section_id]) {
        azkarData[azkar.section_id] = [];
      }
      azkarData[azkar.section_id].push({
        id: azkar.azkar_id,
        text: azkar.text,
        description: azkar.description
      });
    });
    
    res.json({
      sections,
      azkarData
    });
  } catch (err) {
    console.error('Error fetching all azkar data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
