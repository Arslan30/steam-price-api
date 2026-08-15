import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

const CACHE_FILE = '/tmp/price_cache.json';

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Cache load error:', error);
  }

  return {};
}

function saveCache(cache) {
  try {
    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify(cache),
      'utf8'
    );
  } catch (error) {
    console.error('Cache save error:', error);
  }
}

const cache = loadCache();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours — reduced Steam hits dramatically
const CACHE_CLEANUP_INTERVAL = 60 * 60 * 1000;
const STEAM_FETCH_TIMEOUT = 8000;

setInterval(() => {
  const now = Date.now();
  for (const key in cache) {
    if (now - cache[key].timestamp >= CACHE_TTL) delete cache[key];
  }
}, CACHE_CLEANUP_INTERVAL);

app.get('/price', async (req, res) => {
  const item = req.query.item;
  if (!item) return res.status(400).json({ error: 'Missing item name' });

  const key = item.trim().toLowerCase();

  if (cache[key] && Date.now() - cache[key].timestamp < CACHE_TTL) {
    return res.json({ price: cache[key].price, cached: true });
  }

  const encoded = encodeURIComponent(item.trim());
  const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encoded}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STEAM_FETCH_TIMEOUT);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Steam returned ${response.status}` });
    }

    const data = await response.json();
    const price = data.median_price || data.lowest_price || null;

    cache[key] = { price, timestamp: Date.now() };
    res.json({ price, cached: false });

  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') return res.status(504).json({ error: 'Steam request timed out' });
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
