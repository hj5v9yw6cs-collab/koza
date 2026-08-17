// Портрет мастера для первого экрана и страницы «обо мне».
// Положите файл как src/assets/portrait.jpg (или .png / .webp) — подхватится сам.
const modules = import.meta.glob('../assets/portrait.{jpg,jpeg,JPG,JPEG,png,PNG,webp,WEBP}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const found = Object.keys(modules).sort()[0]

export const portrait = found ? modules[found] : null

export default portrait
