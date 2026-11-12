let mostReadCache: any = null;
let mostReadCacheTime = 0;

let trendingCache: any = null;
let trendingCacheTime = 0;

const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export function getMostReadCache() {
  const now = Date.now();
  if (mostReadCache && now - mostReadCacheTime < CACHE_TTL) {
    return mostReadCache;
  }
  return null;
}

export function setMostReadCache(data: any) {
  mostReadCache = data;
  mostReadCacheTime = Date.now();
}

export function invalidateMostReadNewsCache() {
  mostReadCache = null;
  mostReadCacheTime = 0;
}

export function getTrendingCache() {
  const now = Date.now();
  if (trendingCache && now - trendingCacheTime < CACHE_TTL) {
    return trendingCache;
  }
  return null;
}

export function setTrendingCache(data: any) {
  trendingCache = data;
  trendingCacheTime = Date.now();
}

export function invalidateTrendingNewsCache() {
  trendingCache = null;
  trendingCacheTime = 0;
}

