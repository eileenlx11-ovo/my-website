const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.join(__dirname, '..', '..');
const generatedDir = path.join(rootDir, 'assets', 'generated-images');

function getImageProviderStatus() {
  const provider = process.env.IMAGE_PROVIDER || 'gemini';
  if (provider === 'none') {
    return { available: false, provider, model: null, message: '图片生成服务未启用。' };
  }
  if (provider === 'gemini') {
    return {
      available: Boolean(process.env.GEMINI_API_KEY),
      provider,
      model: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image',
      message: process.env.GEMINI_API_KEY ? 'Gemini 图片生成已配置。' : '请在 .env 中配置 GEMINI_API_KEY。'
    };
  }
  if (provider === 'openai_compatible') {
    return {
      available: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_BASE_URL && process.env.OPENAI_IMAGE_MODEL),
      provider,
      model: process.env.OPENAI_IMAGE_MODEL || null,
      message: process.env.OPENAI_API_KEY ? 'OpenAI-compatible 图片生成已配置。' : '请配置 OPENAI_API_KEY、OPENAI_BASE_URL 和 OPENAI_IMAGE_MODEL。'
    };
  }
  return { available: false, provider, model: null, message: '未知图片生成 provider。' };
}

async function generateImage({ prompt }) {
  const status = getImageProviderStatus();
  if (!status.available) {
    const error = new Error(status.message);
    error.code = 'IMAGE_PROVIDER_UNAVAILABLE';
    throw error;
  }
  if (status.provider === 'gemini') {
    return generateWithGemini(prompt, status.model);
  }
  if (status.provider === 'openai_compatible') {
    return generateWithOpenAICompatible(prompt, status.model);
  }
  const error = new Error('图片生成服务未启用。');
  error.code = 'IMAGE_PROVIDER_UNAVAILABLE';
  throw error;
}

async function generateWithGemini(prompt, model) {
  const fake = global.__ANCHOR_SHADOW_IMAGE_PROVIDER_FAKE__;
  if (fake) {
    return fake({ provider: 'gemini', model, prompt });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || 'Gemini 图片生成失败。');
  }

  const imagePart = data.candidates?.flatMap((candidate) => candidate.content?.parts || [])
    .find((part) => part.inlineData?.data || part.inline_data?.data);
  const inlineData = imagePart?.inlineData || imagePart?.inline_data;
  if (!inlineData?.data) {
    throw new Error('Gemini 没有返回图片数据。');
  }

  return saveBase64Image(inlineData.data, inlineData.mimeType || inlineData.mime_type || 'image/png', 'gemini', model);
}

async function generateWithOpenAICompatible(prompt, model) {
  const fake = global.__ANCHOR_SHADOW_IMAGE_PROVIDER_FAKE__;
  if (fake) {
    return fake({ provider: 'openai_compatible', model, prompt });
  }

  const baseUrl = process.env.OPENAI_BASE_URL.replace(/\/$/, '');
  const response = await fetch(`${baseUrl}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model, prompt, size: '1024x1024', response_format: 'b64_json' })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI-compatible 图片生成失败。');
  }
  const base64 = data.data?.[0]?.b64_json;
  if (!base64) {
    throw new Error('OpenAI-compatible provider 没有返回图片数据。');
  }
  return saveBase64Image(base64, 'image/png', 'openai_compatible', model);
}

function saveBase64Image(base64, mimeType, provider, model) {
  fs.mkdirSync(generatedDir, { recursive: true });
  const extension = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : 'png';
  const filename = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${extension}`;
  const assetPath = path.join(generatedDir, filename);
  fs.writeFileSync(assetPath, Buffer.from(base64, 'base64'));
  return {
    provider,
    model,
    assetPath,
    previewUrl: `/assets/generated-images/${filename}`
  };
}

module.exports = { getImageProviderStatus, generateImage, saveBase64Image };
