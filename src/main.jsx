import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'

// Шрифты лежат внутри сайта, а не на Google Fonts: так они грузятся быстрее
// и не зависят от доступности внешнего домена.
import '@fontsource/jost/latin-200.css'
import '@fontsource/jost/latin-300.css'
import '@fontsource/jost/latin-400.css'
import '@fontsource/jost/cyrillic-200.css'
import '@fontsource/jost/cyrillic-300.css'
import '@fontsource/jost/cyrillic-400.css'
import '@fontsource/cormorant-garamond/latin-300-italic.css'
import '@fontsource/cormorant-garamond/cyrillic-300-italic.css'
import '@fontsource/pinyon-script/latin-400.css'

import './styles.css'

// Обычный сайт живёт на путях вида /services. Сборка превью (одним файлом,
// без сервера) не может их отдавать, поэтому там маршруты идут после решётки.
const Router = import.meta.env.VITE_HASH_ROUTER ? HashRouter : BrowserRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)
