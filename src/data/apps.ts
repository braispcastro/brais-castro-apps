export interface AppData {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  rating: number | null;
  ratingCount: number;
  price: string;
  appStoreUrl: string;
  version: string;
  releaseDate: string;
  screenshots: string[];
  bundleId: string;
}

interface ItunesResult {
  wrapperType: string;
  trackId: number;
  trackName: string;
  description: string;
  artworkUrl512: string;
  primaryGenreName: string;
  averageUserRating: number;
  userRatingCount: number;
  formattedPrice: string;
  trackViewUrl: string;
  version: string;
  releaseDate: string;
  screenshotUrls: string[];
  bundleId: string;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function fetchApps(): Promise<AppData[]> {
  const url =
    'https://itunes.apple.com/lookup?id=1604438132&entity=software';

  let data: { resultCount: number; results: ItunesResult[] };

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`iTunes API returned HTTP ${res.status}`);
    }
    data = await res.json();
  } catch (err) {
    throw new Error(
      `Failed to fetch apps from iTunes API: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const apps = data.results.filter((r) => r.wrapperType === 'software');

  if (apps.length === 0) {
    throw new Error(
      'iTunes API returned 0 apps for developer id=1604438132. Check the developer ID or network access.'
    );
  }

  return apps.map((app) => ({
    id: app.trackId,
    name: app.trackName,
    slug: toSlug(app.trackName),
    description: app.description ?? '',
    icon: app.artworkUrl512,
    category: app.primaryGenreName,
    rating:
      app.averageUserRating && app.averageUserRating > 0
        ? Math.round(app.averageUserRating * 10) / 10
        : null,
    ratingCount: app.userRatingCount ?? 0,
    price: app.formattedPrice ?? 'Free',
    appStoreUrl: app.trackViewUrl.replace(/\?uo=\d+$/, ''),
    version: app.version ?? '',
    releaseDate: app.releaseDate ?? '',
    screenshots: app.screenshotUrls ?? [],
    bundleId: app.bundleId,
  }));
}
