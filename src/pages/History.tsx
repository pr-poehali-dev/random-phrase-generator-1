import { useState } from "react";
import { useHistory, HistoryItem } from "@/hooks/useHistory";
import Icon from "@/components/ui/icon";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function History() {
  const { history, clearHistory, removeItem } = useHistory();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterGenre, setFilterGenre] = useState("all");

  const genres = ["all", ...Array.from(new Set(history.map((h) => h.genre).filter(Boolean)))];

  const filtered = filterGenre === "all" ? history : history.filter((h) => h.genre === filterGenre);

  function copyPhrase(item: HistoryItem) {
    navigator.clipboard.writeText(item.phrase);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold neon-text-purple">История</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {history.length > 0 ? `${history.length} сохранённых фраз` : "Пока пусто"}
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <Icon name="Trash2" size={14} />
              Очистить
            </button>
          )}
        </div>

        {/* Genre filter */}
        {history.length > 0 && genres.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setFilterGenre(g)}
                className={`tag-pill ${filterGenre === g ? "active" : ""}`}
              >
                {g === "all" ? "Все" : g}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && (
          <div className="card-glass rounded-2xl p-12 text-center animate-fade-up">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={28} className="text-purple-400" />
            </div>
            <p className="text-foreground font-medium mb-2">История пуста</p>
            <p className="text-muted-foreground text-sm">
              Сгенерируй первую фразу — она автоматически появится здесь
            </p>
          </div>
        )}

        {/* Items */}
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="phrase-card rounded-xl p-5 animate-fade-up flex items-start gap-4 group"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {item.artist?.[0]?.toUpperCase() || "?"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-relaxed mb-2">
                  "{item.phrase}"
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="font-medium text-purple-300">{item.artist || "Неизвестный"}</span>
                  {item.title && <span>{item.title}</span>}
                  {item.genre && item.genre !== "all" && (
                    <span className="tag-pill">{item.genre}</span>
                  )}
                  <span className="ml-auto">{formatDate(item.savedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => copyPhrase(item)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                  title="Скопировать"
                >
                  <Icon name={copiedId === item.id ? "Check" : "Copy"} size={13} />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                  title="Удалить"
                >
                  <Icon name="X" size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
