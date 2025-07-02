
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});