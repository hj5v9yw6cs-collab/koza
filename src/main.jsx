import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
