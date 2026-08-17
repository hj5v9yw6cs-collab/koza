// Прайс перенесён с прайс-листа мастера. Цены в рублях.
export const simpleServices = [
  {
    id: 'manicure',
    title: 'маникюр',
    note: 'обработка кутикулы комбинированным методом, опил формы',
    price: 500,
  },
  {
    id: 'removal',
    title: 'снятие',
    note: 'полное снятие покрытия, обработка кутикулы, опил формы',
    price: 700,
  },
]

// Размеры идут от короткого к длинному, как в прайс-листе.
export const lengths = ['xs', 's', 'm', 'l', 'xl', 'xxl']

export const sizedServices = [
  {
    id: 'correction',
    title: 'коррекция',
    note: 'снятие, маникюр, покрытие гелем + light дизайн',
    prices: { xs: 1300, s: 1500, m: 1700, l: 1900 },
  },
  {
    id: 'extension',
    title: 'наращивание',
    note: 'маникюр, моделирование, покрытие гелем + light дизайн',
    prices: { xs: 1500, s: 1700, m: 1900, l: 2200, xl: 2400, xxl: 2700 },
  },
]

export const extras = [
  { id: 'repair', title: 'ремонт', note: 'донаращивание 1 ногтя', priceLabel: '50–100 ₽' },
  { id: 'design', title: 'сложный дизайн', note: '', priceLabel: '300 ₽' },
]

// Варианты для калькулятора: что можно выбрать как основную услугу.
// min/max нужны там, где цена в прайсе указана вилкой (ремонт).
export const calcServices = [
  { id: 'manicure', title: 'маникюр', min: 500, max: 500 },
  { id: 'removal', title: 'снятие', min: 700, max: 700 },
  { id: 'correction', title: 'коррекция', sized: true },
  { id: 'extension', title: 'наращивание', sized: true },
  { id: 'repair', title: 'ремонт', min: 50, max: 100, note: 'донаращивание 1 ногтя' },
]

// Что можно добавить к основной услуге.
// only — услуги, к которым добавка вообще применима.
export const calcExtras = [
  {
    id: 'design',
    title: 'сложный дизайн',
    price: 300,
    only: ['manicure', 'correction', 'extension', 'repair'],
  },
  {
    id: 'removal',
    title: 'снятие старого покрытия',
    price: 700,
    note: 'коррекция уже включает снятие',
    only: ['manicure', 'extension'],
  },
]

// Плоский список для селекта в форме записи.
export const bookingOptions = [
  ...simpleServices.map((s) => ({ value: s.title, label: `${s.title} — ${s.price} ₽` })),
  ...sizedServices.flatMap((s) =>
    Object.entries(s.prices).map(([size, price]) => ({
      value: `${s.title} ${size}`,
      label: `${s.title} ${size} — ${price} ₽`,
    })),
  ),
  ...extras.map((e) => ({ value: e.title, label: `${e.title} — ${e.priceLabel}` })),
]
