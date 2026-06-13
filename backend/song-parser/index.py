import json
import random
import urllib.request
import urllib.parse

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
}

GENRES = [
    {"id": "all", "name": "Все жанры"},
    {"id": "pop", "name": "Поп"},
    {"id": "rock", "name": "Рок"},
    {"id": "rap", "name": "Рэп"},
    {"id": "electronic", "name": "Электронная"},
    {"id": "indie", "name": "Инди"},
    {"id": "classic", "name": "Классика"},
    {"id": "rnb", "name": "R&B/Soul"},
]

GENRE_QUERIES = {
    "all": ["love", "life", "night", "dream", "heart", "time", "world", "feel", "run", "dance"],
    "pop": ["pop love", "pop hit", "pop dance", "pop music", "sugar"],
    "rock": ["rock guitar", "rock band", "rock anthem", "stone", "thunder"],
    "rap": ["hip hop", "rap flow", "street life", "hustle", "beat"],
    "electronic": ["electronic dance", "synth", "techno", "neon", "wave"],
    "indie": ["indie folk", "indie rock", "indie pop", "wanderlust", "wild"],
    "classic": ["classic soul", "timeless", "golden", "forever", "blue"],
    "rnb": ["soul music", "rhythm blues", "groove", "smooth", "feels"],
}

RUSSIAN_ARTISTS = [
    "Земфира", "Кино", "Виктор Цой", "Сплин", "Би-2", "Ария",
    "Алиса", "ДДТ", "Nautilus Pompilius", "Наутилус Помпилиус",
    "Океан Ельзи", "Ленинград", "Рамштайн", "Мумий Тролль",
    "Brainstorm", "Zveri", "Звери", "Чайф", "Пикник",
    "Lumen", "Люмен", "Агата Кристи", "Король и Шут",
    "Тараканы", "Порнофильмы", "Элизиум", "Loqiemean",
    "FACE", "Pharaoh", "Фараон", "IC3PEAK", "Оксимирон",
    "Noize MC", "Баста", "Гуф", "Смоки Мо", "Centr",
    "Anacondaz", "Markul", "Maruv", "Niletto", "Jah Khalib",
    "Макс Барских", "Настя Каменских", "Олег Кензов",
    "Иван Дорн", "Дима Билан", "Филипп Киркоров",
    "Валерия", "Пугачева", "Алла Пугачёва", "Николай Басков",
    "Рoтару", "София Ротару", "Полина Гагарина",
    "Ёлка", "МакSим", "Максим", "Глюкоза", "Тату", "t.A.T.u.",
    "Serebro", "Серебро", "Reflex", "Рефлекс",
    "Дворовые коты", "Lube", "Любэ", "Руки Вверх",
    "Иванушки", "На-На", "Мираж", "Ласковый май",
    "Кар-мэн", "Кристина Орбакайте", "Жасмин",
    "Shaman", "Шаман", "Клава Кока", "Мот", "Скриптонит",
    "Morgenshtern", "Егор Крид", "Артем Пивоваров",
    "Моя Мишель", "LOBODA", "Лобода", "Zivert", "Зиверт",
]

def is_cyrillic(text):
    cyrillic_count = sum(1 for c in text if '\u0400' <= c <= '\u04FF')
    return cyrillic_count / max(len(text), 1) > 0.3

def fetch_json(url):
    req = urllib.request.Request(
        url,
        headers={
            'User-Agent': 'LyricsPhraseGenerator/1.0',
            'Accept': 'application/json'
        }
    )
    with urllib.request.urlopen(req, timeout=12) as resp:
        return json.loads(resp.read().decode('utf-8'))

def pick_random_phrase(lyrics_text):
    lines = [l.strip() for l in lyrics_text.split('\n') if len(l.strip()) > 10]
    if not lines:
        return None
    start = random.randint(0, max(0, len(lines) - 1))
    length = random.randint(1, min(3, len(lines) - start))
    phrase = " / ".join(lines[start:start + length])
    return phrase if len(phrase) > 10 else None

def handler(event: dict, context) -> dict:
    """Возвращает случайную фразу из песни через lrclib.net API.
    Поддерживает фильтрацию по жанру и поиск по автору.
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'random')

    if action == 'genres':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'genres': GENRES}, ensure_ascii=False)
        }

    if action == 'random':
        genre_id = params.get('genre', 'all')
        artist_filter = params.get('artist', '').strip()
        lang = params.get('lang', 'any')  # 'ru', 'en', 'any'

        queries = GENRE_QUERIES.get(genre_id, GENRE_QUERIES['all'])
        query = random.choice(queries)

        if lang == 'ru' and not artist_filter:
            artist_filter = random.choice(RUSSIAN_ARTISTS)

        if artist_filter:
            url = f"https://lrclib.net/api/search?artist_name={urllib.parse.quote(artist_filter)}"
        else:
            url = f"https://lrclib.net/api/search?q={urllib.parse.quote(query)}"

        results = fetch_json(url)

        if not results:
            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'not_found'}, ensure_ascii=False)
            }

        random.shuffle(results)

        for track in results[:15]:
            lyrics = track.get('plainLyrics') or ''
            if not lyrics or track.get('instrumental'):
                continue

            if lang == 'ru' and not is_cyrillic(lyrics):
                continue
            if lang == 'en' and is_cyrillic(lyrics):
                continue

            phrase = pick_random_phrase(lyrics)
            if not phrase:
                continue

            if lang == 'ru' and not is_cyrillic(phrase):
                continue

            return {
                'statusCode': 200,
                'headers': CORS_HEADERS,
                'body': json.dumps({
                    'phrase': phrase,
                    'title': track.get('trackName', ''),
                    'artist': track.get('artistName', ''),
                    'album': track.get('albumName', ''),
                    'genre': genre_id,
                    'lang': lang,
                }, ensure_ascii=False)
            }

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'not_found'}, ensure_ascii=False)
        }

    return {
        'statusCode': 400,
        'headers': CORS_HEADERS,
        'body': json.dumps({'error': 'unknown_action'}, ensure_ascii=False)
    }