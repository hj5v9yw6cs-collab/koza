// Собирает сайт в один автономный HTML-фрагмент для превью-артефакта.
// Артефакт сам оборачивает файл в <html>/<head>/<body> и запрещает запросы
// на внешние домены, поэтому здесь всё встраивается внутрь: стили, скрипт,
// шрифты и фотографии (последние два — как data-URI, это делает Vite).
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'dist-preview')
const target = process.argv[2] || path.join(outDir, 'preview.html')

execFileSync('npx', ['vite', 'build'], {
  stdio: 'inherit',
  env: { ...process.env, VITE_INLINE_ALL: '1', VITE_HASH_ROUTER: '1' },
})

const html = fs.readFileSync(path.join(outDir, 'index.html'), 'utf8')

const read = (src) => fs.readFileSync(path.join(outDir, src.replace(/^\.?\//, '')), 'utf8')

let body = html
  // <script type="module" src="./assets/index-xxx.js"> → содержимое скрипта
  .replace(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
    return `<script type="module">\n${read(src)}\n</script>`
  })
  // <link rel="stylesheet" href="./assets/index-xxx.css"> → содержимое стилей
  .replace(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*\/?>/g, (_, href) => {
    return `<style>\n${read(href)}\n</style>`
  })

// Оставляем только содержимое страницы: обёртку добавит сам артефакт.
// В галерее артефактов нужно короткое имя, без пояснения после тире.
const fullTitle = body.match(/<title>([^<]*)<\/title>/)?.[1] ?? 'Екатерина Козлова'
const title = fullTitle.split(' — ')[0]
const head = body.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? ''
const inner = body.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] ?? ''

// Vite кладёт и стили, и модуль скрипта в <head>. Стили оставляем сверху,
// скрипт переносим после разметки, чтобы #root уже существовал.
const styles = head.match(/<style>[\s\S]*?<\/style>/g)?.join('\n') ?? ''
const scripts = head.match(/<script[\s\S]*?<\/script>/g)?.join('\n') ?? ''

if (!scripts) {
  console.error('ОШИБКА: в собранном файле не нашёлся скрипт — превью будет пустым')
  process.exit(1)
}

fs.mkdirSync(path.dirname(target), { recursive: true })
fs.writeFileSync(target, `<title>${title}</title>\n${styles}\n${inner}\n${scripts}\n`)

const mb = (fs.statSync(target).size / 1024 / 1024).toFixed(2)
console.log(`\nпревью: ${target} — ${mb} MB`)
if (fs.statSync(target).size > 15.5 * 1024 * 1024) {
  console.error('ВНИМАНИЕ: файл близок к лимиту артефакта в 16 MB')
  process.exit(1)
}
