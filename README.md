# Steam Price API

A simple Express API to fetch and cache Steam market prices with rate limiting and error handling.

## Features
- Fetches prices from Steam Community Market
- Caches results in memory
- Rate limits outgoing requests to avoid HTTP 429 errors
- Configurable via environment variables
- Logging with winston

## Setup

1. Clone the repo
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file (see below)
4. Start the server:
   ```sh
   npm start
   ```

## Environment Variables

- `PORT` - Port to run the server (default: 3000)
- `STEAM_API_URL` - Steam API endpoint (default: https://steamcommunity.com/market/priceoverview/)
- `STEAM_APPID` - Steam App ID (default: 730)
- `STEAM_CURRENCY` - Currency code (default: 1)
- `CACHE_TTL` - Cache time-to-live in ms (default: 300000)
- `RATE_LIMIT_MIN_TIME` - Minimum ms between requests to Steam (default: 1100)

## API

### GET `/price?item=ITEM_NAME`
- **Query Parameters:**
  - `item` (required): The market hash name of the item
- **Response:**
  - `price`: The price string
  - `cached`: Boolean, true if result was from cache

**Example:**
```
GET /price?item=AK-47%20Redline%20(Field-Tested)
```

## License
MIT 
