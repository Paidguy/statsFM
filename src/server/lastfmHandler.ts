import type { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

interface CacheEntry {
  data: any;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache
const responseCache = new Map<string, CacheEntry>();

const ALLOWED_METHODS = new Set([
  'user.getinfo',
  'user.gettopartists',
  'user.gettoptracks',
  'user.gettopalbums',
  'user.getrecenttracks',
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
    const period = fullUrl.searchParams.get('period') || '';
    const limit = fullUrl.searchParams.get('limit') || '';
    const page = fullUrl.searchParams.get('page') || '';

    // Whitelist check
    const normalizedMethod = method.toLowerCase();
    if (!ALLOWED_METHODS.has(normalizedMethod)) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 400, message: 'Method not allowed' }));
      return;
    }

    if (!user) {
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 400, message: 'Username is required' }));
      return;
    }

    // Check cache
    const cacheKey = `${normalizedMethod}:${user.toLowerCase()}:${period}:${limit}:${page}`;
    const now = Date.now();
    const cached = responseCache.get(cacheKey);

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
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
    apiUrl.searchParams.set('user', user);
    apiUrl.searchParams.set('api_key', apiKey);
    apiUrl.searchParams.set('format', 'json');
    if (period) apiUrl.searchParams.set('period', period);
    if (limit) apiUrl.searchParams.set('limit', limit);
    if (page) apiUrl.searchParams.set('page', page);

    let lastFmRes = await fetch(apiUrl.toString(), {
      headers: {
        'User-Agent': 'NeedleDrop/1.0.0 (https://needledrop.app)',
        'Accept': 'application/json'
      }
    });

    // If rate limit error or key issue with primary key, try fallback key
    let data = await lastFmRes.json();
    if ((data.error === 29 || data.error === 10) && apiKey !== FALLBACK_KEYS[1]) {
      apiUrl.searchParams.set('api_key', FALLBACK_KEYS[1]);
      const retryRes = await fetch(apiUrl.toString(), {
        headers: {
          'User-Agent': 'NeedleDrop/1.0.0 (https://needledrop.app)',
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
      // Clean up cache older than 10 mins
      if (responseCache.size > 200) {
        for (const [k, v] of responseCache.entries()) {
          if (now - v.timestamp > CACHE_TTL_MS * 2) {
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
