const API_URL = "https://functions.poehali.dev/e68e34be-3e27-4761-87a2-84431a0a93ec";

export interface Genre {
  id: string;
  name: string;
}

export interface PhraseResult {
  phrase: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  error?: string;
}

export async function fetchGenres(): Promise<Genre[]> {
  const res = await fetch(`${API_URL}/?action=genres`);
  const data = await res.json();
  return data.genres || [];
}

export async function fetchRandomPhrase(
  genre: string = "all",
  artist: string = "",
  lang: string = "any"
): Promise<PhraseResult> {
  const params = new URLSearchParams({ action: "random", genre, lang });
  if (artist.trim()) params.set("artist", artist.trim());
  const res = await fetch(`${API_URL}/?${params}`);
  return res.json();
}