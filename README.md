# koza

Сайт Екатерины Козловой, мастера маникюра в Екатеринбурге: услуги, калькулятор
стоимости, портфолио и запись, которая приходит в Telegram.

Стек: Vite + React + React Router. Хостинг — Cloudflare Workers: статику отдаёт
привязка ASSETS, а заявки принимает воркер в `worker/`, поэтому токен бота
остаётся на сервере и в браузер не попадает.

## Запуск локально

```bash
npm install
npm run dev
```

В этом режиме работает всё, кроме отправки заявок: приём заявок живёт в воркере.
Чтобы проверить и его, нужен wrangler:

```bash
cp .env.example .dev.vars   # вписать токен и chat_id
npm run build
npx wrangler dev
```

## Куда что править

| Что | Файл |
|---|---|
| Имя, город, тексты «обо мне», контакты, оговорки | `src/data/site.js` |
| Прайс, состав услуг, добавки в калькуляторе | `src/data/services.js` |
| Фото работ | папка `src/assets/portfolio/` |
| Портрет мастера | `src/assets/portrait.webp` |
| Цвета и типографика | `src/styles.css` (переменные в `:root`) |
| Приём заявок | `worker/booking.js` |

### Фото работ

Положите файлы (`.jpg`, `.png`, `.webp`) в `src/assets/portfolio/` — галерея
соберётся сама, править код не нужно. Порядок — по имени файла, поэтому удобно
называть `01.webp`, `02.webp` и так далее. Первое фото попадает и на главную.

## Телеграм-бот для заявок

1. Написать [@BotFather](https://t.me/BotFather) → `/newbot` → получить токен
   вида `123456789:AAE...`.
2. Написать своему новому боту любое сообщение, иначе он не сможет ответить.
3. Узнать свой `chat_id` — например, через [@userinfobot](https://t.me/userinfobot).

## Деплой

Cloudflare собирает проект автоматически при каждом push в `main`.

Настройки сборки (Deployments → Build settings):

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Переменные (Settings → Variables and Secrets, тип **Secret**):

- `TELEGRAM_BOT_TOKEN` — токен из BotFather
- `TELEGRAM_CHAT_ID` — свой chat_id

После добавления переменных нужно пересобрать: Deployments → Retry build.

### Важное про конфигурацию

`wrangler.toml` задаёт настройки явно. Без него wrangler пытается угадать их по
проекту и на Vite 5 останавливается с ошибкой «The version of Vite used in the
project cannot be automatically configured».

В `[assets]` намеренно не включён `not_found_handling = "single-page-application"`:
в этом режиме роутер статики отвечал бы на все адреса сам, воркер бы не
запускался, и запись на `/api/booking` перестала бы работать. Поэтому фолбэк на
`index.html` делает сам воркер, а `html_handling = "none"` убирает лишний
редирект `/services` → `/services/`.

## Превью без деплоя

```bash
node scripts/build-preview.mjs preview.html
```

Собирает сайт одним автономным HTML со встроенными стилями, шрифтами и фото —
удобно показать вид сайта, ничего не публикуя.
