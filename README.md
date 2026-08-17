# koza

Сайт мастера маникюра: витрина услуг, портфолио и запись, которая приходит в Telegram.

Стек: Vite + React + React Router, хостинг — Cloudflare Pages, форма записи работает
через Pages Function (`functions/api/booking.js`), поэтому токен бота не попадает в браузер.

## Запуск локально

```bash
npm install
npm run dev
```

Форма записи в режиме `npm run dev` не отправляет заявки — серверная функция живёт только
на Cloudflare. Чтобы проверить её локально, нужен wrangler:

```bash
cp .env.example .dev.vars   # вписать токен и chat_id
npm run build
npx wrangler pages dev dist
```

## Куда что править

| Что | Файл |
|---|---|
| Имя, город, тексты «обо мне», ссылки на соцсети | `src/data/site.js` |
| Прайс и состав услуг | `src/data/services.js` |
| Фото работ | папка `src/assets/portfolio/` |
| Цвета и типографика | `src/styles.css` (переменные в `:root`) |

### Фото работ

Просто положите файлы (`.jpg`, `.png`, `.webp`) в `src/assets/portfolio/` — галерея
соберётся сама, ничего дописывать в коде не нужно. Порядок — по имени файла,
поэтому удобно называть `01.jpg`, `02.jpg` и так далее. Первое фото попадает
ещё и на главную.

## Телеграм-бот для заявок

1. Написать [@BotFather](https://t.me/BotFather) → `/newbot` → получить токен
   вида `123456789:AAE...`.
2. Написать своему новому боту любое сообщение (иначе он не сможет ответить).
3. Узнать свой `chat_id`: открыть
   `https://api.telegram.org/bot<ТОКЕН>/getUpdates` и найти `"chat":{"id":...}`.
   Либо написать [@userinfobot](https://t.me/userinfobot).

## Деплой на Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** →
   **Create** → **Pages** → **Connect to Git** → выбрать этот репозиторий.
2. Настройки сборки:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
3. **Settings → Environment variables** → добавить для Production и Preview:
   - `TELEGRAM_BOT_TOKEN` — токен из BotFather
   - `TELEGRAM_CHAT_ID` — свой chat_id
4. Пересобрать (Deployments → Retry deployment), чтобы переменные подхватились.

Дальше каждый push в ветку автоматически публикует новую версию сайта.
