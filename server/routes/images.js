const express = require('express');
const { z } = require('zod');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { writeLimiter } = require('../middleware/rateLimit');
const { getWork } = require('../services/worksRepository');
const { buildImagePrompt, imageTypeLabel } = require('../services/imagePromptBuilder');
const { getImageProviderStatus, generateImage } = require('../services/imageProvider');

const router = express.Router();

const imageSchema = z.object({
  type: z.enum(['ticket', 'bookmark', 'poster'], { message: '请选择票券、书签或海报。' }),
  style: z.string().trim().max(80, '风格描述不能超过 80 字。').optional().default('')
});

router.get('/image/status', (_req, res) => {
  res.json(getImageProviderStatus());
});

router.get('/works/:id/images', (req, res) => {
  const db = getDb();
  const work = getWork(db, Number(req.params.id));
  if (!work) {
    res.status(404).json({ error: '没有找到这条作品记录。' });
    return;
  }

  const images = db.prepare(`
    SELECT id, type, provider, model, status, preview_url, error, created_at
    FROM generated_images
    WHERE work_id = ? AND status = 'succeeded'
    ORDER BY id DESC
    LIMIT 12
  `).all(work.id).map(mapImage);
  res.json({ images });
});

router.post('/works/:id/images', requireAuth, writeLimiter, validate(imageSchema), async (req, res) => {
  const db = getDb();
  const work = getWork(db, Number(req.params.id));
  if (!work) {
    res.status(404).json({ error: '没有找到这条作品记录。' });
    return;
  }

  const status = getImageProviderStatus();
  const prompt = buildImagePrompt(work, req.body.type, req.body.style);
  const insert = db.prepare(`
    INSERT INTO generated_images (work_id, user_id, type, provider, model, prompt, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(work.id, req.user.id, req.body.type, status.provider, status.model, prompt);

  try {
    const result = await generateImage({ prompt });
    db.prepare(`
      UPDATE generated_images
      SET provider = ?, model = ?, status = 'succeeded', asset_path = ?, preview_url = ?
      WHERE id = ?
    `).run(result.provider, result.model, result.assetPath, result.previewUrl, insert.lastInsertRowid);

    const image = db.prepare('SELECT * FROM generated_images WHERE id = ?').get(insert.lastInsertRowid);
    res.status(201).json({ image: mapImage(image), label: imageTypeLabel(req.body.type) });
  } catch (error) {
    db.prepare(`
      UPDATE generated_images SET status = 'failed', error = ? WHERE id = ?
    `).run(error.message, insert.lastInsertRowid);
    const code = error.code === 'IMAGE_PROVIDER_UNAVAILABLE' ? 503 : 502;
    res.status(code).json({ error: error.message });
  }
});

function mapImage(row) {
  return {
    id: row.id,
    type: row.type,
    provider: row.provider,
    model: row.model,
    status: row.status,
    previewUrl: row.preview_url,
    error: row.error,
    createdAt: row.created_at
  };
}

module.exports = router;
