// Фото работ подхватываются автоматически: положите файлы в src/assets/portfolio/
// (jpg / jpeg / png / webp) — Vite сам их найдёт, сожмёт и добавит в галерею.
// Порядок — по имени файла, поэтому удобно называть 01.jpg, 02.jpg и так далее.
const modules = import.meta.glob('../assets/portfolio/*.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const photos = Object.keys(modules)
  .sort()
  .map((path) => ({
    src: modules[path],
    name: path.split('/').pop(),
  }))

export default photos
