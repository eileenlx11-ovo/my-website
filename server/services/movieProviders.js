const { fetchJson } = require('./providerHttp');

async function searchMovies(query) {
  const results = [];

  if (process.env.TMDB_API_KEY) {
    const tmdb = await fetchJson(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=zh-CN&api_key=${process.env.TMDB_API_KEY}`);
    if (tmdb?.results) {
      for (const movie of tmdb.results.slice(0, 5)) {
        results.push({
          sourceType: 'tmdb',
          kind: 'movie',
          literatureTitle: null,
          literatureAuthor: null,
          quote: null,
          movieTitle: movie.title,
          movieYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
          movieDirector: null,
          description: movie.overview || `TMDB 电影资料：${movie.title}`,
          externalUrl: `https://www.themoviedb.org/movie/${movie.id}`,
          keywords: [query, movie.title].filter(Boolean),
          videos: []
        });
      }
    }
  }

  if (process.env.OMDB_API_KEY) {
    const omdb = await fetchJson(`https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=movie&apikey=${process.env.OMDB_API_KEY}`);
    if (omdb?.Search) {
      for (const movie of omdb.Search.slice(0, 5)) {
        results.push({
          sourceType: 'omdb',
          kind: 'movie',
          literatureTitle: null,
          literatureAuthor: null,
          quote: null,
          movieTitle: movie.Title,
          movieYear: Number(movie.Year) || null,
          movieDirector: null,
          description: `OMDb 电影资料：${movie.Title}${movie.Year ? `，${movie.Year}` : ''}`,
          externalUrl: `https://www.imdb.com/title/${movie.imdbID}/`,
          keywords: [query, movie.Title].filter(Boolean),
          videos: []
        });
      }
    }
  }

  return results;
}

module.exports = { searchMovies };
