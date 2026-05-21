const providerPatterns = {
  bilibili: /^BV[0-9A-Za-z]+$/,
  youtube: /^[0-9A-Za-z_-]{11}$/,
  vimeo: /^[0-9]+$/
};

function isSupportedProvider(provider) {
  return Object.prototype.hasOwnProperty.call(providerPatterns, provider);
}

function buildEmbedUrl(provider, providerVideoId) {
  if (!isSupportedProvider(provider)) return null;
  if (!providerPatterns[provider].test(providerVideoId)) return null;

  if (provider === 'bilibili') {
    return `https://player.bilibili.com/player.html?bvid=${providerVideoId}&page=1&high_quality=1&danmaku=0`;
  }
  if (provider === 'youtube') {
    return `https://www.youtube.com/embed/${providerVideoId}`;
  }
  if (provider === 'vimeo') {
    return `https://player.vimeo.com/video/${providerVideoId}`;
  }
  return null;
}

function safeVideo(video) {
  const embedUrl = buildEmbedUrl(video.provider, video.provider_video_id || video.providerVideoId);
  if (!embedUrl) return null;
  return {
    id: video.id,
    provider: video.provider,
    providerVideoId: video.provider_video_id || video.providerVideoId,
    embedUrl,
    title: video.title,
    thumbnailUrl: video.thumbnail_url || video.thumbnailUrl || null
  };
}

module.exports = { isSupportedProvider, buildEmbedUrl, safeVideo };
