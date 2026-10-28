import type { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const USER_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache for user stats
const ARTIST_CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes cache for global artist metadata
const responseCache = new Map<string, CacheEntry>();

const ALLOWED_METHODS = new Set([
  'user.getinfo',
  'user.gettopartists',
  'user.gettoptracks',
  'user.gettopalbums',
  'user.getrecenttracks',
  'artist.getinfo',
]);

const FALLBACK_KEYS = [
  'aa72a3b1161d33d0eba36f986fa1fb43',
  'b25b959554ed76058ac220b7b2e0a026'
];

export async function handleLastFmRequest(req: IncomingMessage, res: ServerResponse) {
  try {
    const fullUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const method = fullUrl.searchParams.get('method') || '';
    const user = (fullUrl.searchParams.get('user') || '').trim();
    const artist = (fullUrl.searchParams.get('artist') || '').trim();
    const period = fullUrl.searchParams.get('period') || '';
    const limit = fullUrl.searchParams.get('limit') || '';
    const page = fullUrl.searchParams.get('page') || '';
    const from = fullUrl.searchParams.get('from') || '';
    const to = fullUrl.searchParams.get('to') || '';
    const autocorrect = fullUrl.searchParams.get('autocorrect') || '';

    // Whitelist check
    const normalizedMethod = method.toLowerCase();
    if (!ALLOWED_METHODS.has(normalizedMethod)) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 400, message: 'Method not allowed' }));
      return;
    }

    const isArtistMethod = normalizedMethod.startsWith('artist.');
    if (isArtistMethod && !artist) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 400, message: 'Artist name is required' }));
      return;
    }

    if (!isArtistMethod && !user) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 400, message: 'Username is required' }));
      return;
    }

    // Check cache
    const ttl = isArtistMethod ? ARTIST_CACHE_TTL_MS : USER_CACHE_TTL_MS;
    const cacheKey = `${normalizedMethod}:${user.toLowerCase()}:${artist.toLowerCase()}:${period}:${limit}:${page}:${from}:${to}`;
    const now = Date.now();
    const cached = responseCache.get(cacheKey);

    if (cached && now - cached.timestamp < ttl) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify(cached.data));
      return;
    }

    // Prepare API Key
    const apiKey = process.env.LASTFM_API_KEY || FALLBACK_KEYS[0];

    const apiUrl = new URL('https://ws.audioscrobbler.com/2.0/');
    apiUrl.searchParams.set('method', normalizedMethod);
    if (user) apiUrl.searchParams.set('user', user);
    if (artist) apiUrl.searchParams.set('artist', artist);
    apiUrl.searchParams.set('api_key', apiKey);
    apiUrl.searchParams.set('format', 'json');
    if (period) apiUrl.searchParams.set('period', period);
    if (limit) apiUrl.searchParams.set('limit', limit);
    if (page) apiUrl.searchParams.set('page', page);
    if (from) apiUrl.searchParams.set('from', from);
    if (to) apiUrl.searchParams.set('to', to);
    if (autocorrect) apiUrl.searchParams.set('autocorrect', autocorrect);

    const lastFmRes = await fetch(apiUrl.toString(), {
      headers: {
        'User-Agent': 'statsFM/1.0.0 (https://paidguy.me/statsfm)',
        'Accept': 'application/json'
      }
    });

    // If rate limit error or key issue with primary key, try fallback key
    let data = await lastFmRes.json();
    if ((data.error === 29 || data.error === 10) && apiKey !== FALLBACK_KEYS[1]) {
      apiUrl.searchParams.set('api_key', FALLBACK_KEYS[1]);
      const retryRes = await fetch(apiUrl.toString(), {
        headers: {
          'User-Agent': 'statsFM/1.0.0 (https://paidguy.me/statsfm)',
          'Accept': 'application/json'
        }
      });
      const retryData = await retryRes.json();
      if (!retryData.error) {
        data = retryData;
      }
    }

    // Cache successful responses
    if (!data.error) {
      responseCache.set(cacheKey, { data, timestamp: now });
      if (responseCache.size > 500) {
        for (const [k, v] of responseCache.entries()) {
          if (now - v.timestamp > ARTIST_CACHE_TTL_MS) {
            responseCache.delete(k);
          }
        }
      }
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'X-Cache': 'MISS',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 500, message: 'Could not reach Last.fm. Try again in a minute.' }));
  }
}
