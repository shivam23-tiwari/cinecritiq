import { getFallbackData, fallbackMovies } from "./fallbackData";

const TMDB_BASE_URL = "/api/tmdb";

export const getTmdbOptions = () => {
  return {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  };
};

const cache = new Map<string, any>();

export const fetchFromTmdb = async (
  endpoint: string,
  params: Record<string, string> = {},
) => {
  if (endpoint.includes('undefined') || endpoint.includes('null')) {
    return getFallbackData(endpoint, params);
  }
  // Instead of an absolute URL, use a relative path so cookies are sent correctly
  const url = new URL(TMDB_BASE_URL + endpoint, 'http://localhost');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  const relativeUrl = url.pathname + url.search;

  const cacheKey = url.toString();
  

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  const options: RequestInit = {
    method: "GET",
    headers: {
      accept: "application/json",
    },
    credentials: "include",
    signal: controller.signal,
  };

  try {
    const response = await fetch(relativeUrl, options);
    clearTimeout(timeoutId);
    if (!response.ok) {
      console.warn(
        `TMDB API Error: ${response.status} ${response.statusText}. Using fallback data.`,
      );
      return getFallbackData(endpoint, params);
    }
    const text = await response.text();
    
    // Check if the response is actually HTML
    if (text.trim().toLowerCase().startsWith("<!doctype html>") || text.trim().toLowerCase().startsWith("<html")) {
      console.warn(`TMDB proxy returned HTML instead of JSON. URL: ${relativeUrl}. Falling back.`);
      return getFallbackData(endpoint, params);
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse TMDB response as JSON for URL", url.toString(), "Response text:", text.substring(0, 100));
      return getFallbackData(endpoint, params);
    }
    console.log("TMDB Interceptor triggered for:", endpoint, "with ID:", data.id);


    
   
    // Intercept 1727469 (Untitled Kane Parsons Project)
    if (data.results && Array.isArray(data.results)) {
      data.results = data.results.filter((item) => {
        const title = (item.title || item.name || item.original_title || item.original_name || "").toLowerCase();
        if (title.includes("untitled")) return false;
        if (!item.poster_path && !item.profile_path && item.media_type !== 'person') return false;
        return true;
      });
    }
    
    if (data.cast && Array.isArray(data.cast)) {
       data.cast = data.cast.filter((item) => {
         const title = (item.title || item.name || item.original_title || item.original_name || "").toLowerCase();
         if (title.includes("untitled")) return false;
         if (!item.poster_path && !item.profile_path) return false;
         return true;
       });
    }
    
    if (data.crew && Array.isArray(data.crew)) {
       data.crew = data.crew.filter((item) => {
         const title = (item.title || item.name || item.original_title || item.original_name || "").toLowerCase();
         if (title.includes("untitled")) return false;
         if (!item.poster_path && !item.profile_path) return false;
         return true;
       });
    }
    
    if (data.cast && Array.isArray(data.cast)) {
       data.cast = data.cast.filter((item) => {
         const title = item.title || item.name || "";
         if (title.toLowerCase().includes("untitled")) return false;
         if (!item.poster_path && !item.profile_path) return false;
         return true;
       });
    }
    
    if (data.crew && Array.isArray(data.crew)) {
       data.crew = data.crew.filter((item) => {
         const title = item.title || item.name || "";
         if (title.toLowerCase().includes("untitled")) return false;
         if (!item.poster_path && !item.profile_path) return false;
         return true;
       });
    }
    // If TMDB returns an explicit empty results array for paginated endpoints, fallback
    if (
      data.results &&
      Array.isArray(data.results) &&
      data.results.length === 0
    ) {
      return getFallbackData(endpoint, params);
    }
    // Check if it's a completely empty object
    if (Object.keys(data).length === 0) {
      return getFallbackData(endpoint, params);
    }

    // Intercept movies/tv shows that exist in TMDB but have missing critical info
    
    
    if (
      (endpoint.startsWith('/movie/') || endpoint.startsWith('/tv/')) &&


      !endpoint.includes('/similar') &&
      !endpoint.includes('/watch') &&
      !endpoint.includes('/credits') &&
      !endpoint.includes('/videos') &&
      !endpoint.includes('/images')
    ) {
      if (!data.overview || !data.poster_path) {
         const fallback = getFallbackData(endpoint, params);
         if (fallback && (fallback as any).overview) {
            return { ...data, ...fallback };
         } else {
            
         }
      }
    }

    
    
    
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.warn(
      "Network error fetching from TMDB. Using fallback data.",
      error,
    );
    return getFallbackData(endpoint, params);
  }
};

export const getImageUrl = (
  path: string | undefined | null,
  size: "w92" | "w200" | "w500" | "original" | "w1280" = "original",
) => {
  if (!path) return undefined;
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
