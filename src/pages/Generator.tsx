import { useState, useEffect } from "react";
import { fetchGenres, fetchRandomPhrase, Genre, PhraseResult } from "@/lib/api";
import { useHistory } from "@/hooks/useHistory";
import Icon from "@/components/ui/icon";

export default function Generator() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [artistInput, setArtistInput] = useState("");
  const [phrase, setPhrase] = useState<PhraseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const { addToHistory } = useHistory();

  useEffect(() => {
    fetchGenres().then(setGenres);
  }, []);

  async function generate() {
    setLoading(true);
    setPhrase(null);
    const result = await fetchRandomPhrase(selectedGenre, artistInput);
    setPhrase(result);
    setAnimKey((k) => k + 1);
    addToHistory(result);
    setLoading(false);
  }

  function copyPhrase() {
    if (!phrase?.phrase) return;
    navigator.clipboard.writeText(phrase.phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 tag-pill mb-4">
            <Icon name="Sparkles" size={12} />
            <span>Случайные фразы из музыки</span>
          </div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold mb-3 leading-tight">
            <span className="neon-text-purple">LYRIX</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Нажми — получи строку из случайной песни
          </p>
        </div>

        {/* Filters */}
        <div className="card-glass rounded-2xl p-5 mb-6 space-y-4">
          {/* Genre pills */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Жанр</p>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGenre(g.id)}
                  className={`tag-pill ${selectedGenre === g.id ? "active" : ""}`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Artist search */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Исполнитель (необязательно)</p>
            <div className="relative">
              <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={artistInput}
                onChange={(e) => setArtistInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                placeholder="Например: Queen, Eminem..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-foreground placeholder:text-muted-foreground outline-none focus:border-purple-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={loading}
          className="btn-neon w-full rounded-xl py-4 text-base font-bold tracking-wide flex items-center justify-center gap-3 mb-8 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Icon name="Loader2" size={20} className="animate-spin" />
              Ищем случайную строку...
            </>
          ) : (
            <>
              <Icon name="Shuffle" size={20} />
              Сгенерировать фразу
            </>
          )}
        </button>

        {/* Result card */}
        {phrase && !phrase.error && (
          <div key={animKey} className="phrase-card rounded-2xl p-7 animate-fade-up">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1">
                <blockquote className="text-xl sm:text-2xl font-medium leading-relaxed text-foreground mb-1">
                  "{phrase.phrase}"
                </blockquote>
              </div>
              <button
                onClick={copyPhrase}
                title="Скопировать"
                className="shrink-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              >
                <Icon name={copied ? "Check" : "Copy"} size={16} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
                  {phrase.artist?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{phrase.artist || "Неизвестный"}</p>
                  <p className="text-xs text-muted-foreground">{phrase.title || "Без названия"}</p>
                </div>
              </div>
              {phrase.album && (
                <span className="tag-pill ml-auto">
                  <Icon name="Disc3" size={10} className="inline mr-1" />
                  {phrase.album}
                </span>
              )}
            </div>
          </div>
        )}

        {phrase?.error === "not_found" && (
          <div key={animKey} className="card-glass rounded-2xl p-7 animate-fade-up text-center">
            <Icon name="SearchX" size={36} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Ничего не нашлось — попробуй другой жанр или исполнителя</p>
          </div>
        )}

        {/* Hint on first load */}
        {!phrase && !loading && (
          <div className="text-center text-muted-foreground/40 text-sm mt-4 flex items-center justify-center gap-2">
            <Icon name="ArrowUp" size={14} />
            Нажми кнопку выше, чтобы начать
          </div>
        )}
      </div>
    </div>
  );
}
