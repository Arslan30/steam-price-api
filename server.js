import express from 'express';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

const cache = {};

app.get('/price', async (req, res) => {
  const item = req.query.item;
  if (!item) return res.status(400).send('Missing item name');

  const key = item.trim().toLowerCase();
  if (cache[key] && Date.now() - cache[key].timestamp < 300000) {
    return res.json({ price: cache[key].price, cached: true });
  }

  const encoded = encodeURIComponent(item);
  const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=1&market_hash_name=${encoded}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(response.status).send('Steam error');

    const data = await response.json();
    const price = data.median_price || data.lowest_price || null;
    cache[key] = { price, timestamp: Date.now() };
    res.json({ price, cached: false });
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
