import ReactDOM from 'react-dom/client'

import '@fontsource/orbitron/latin-700.css'
import '@fontsource/orbitron/latin-800.css'
import '@fontsource/orbitron/latin-900.css'
import '@fontsource/rajdhani/latin-400.css'
import '@fontsource/rajdhani/latin-500.css'
import '@fontsource/rajdhani/latin-600.css'
import '@fontsource/rajdhani/latin-700.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import '@fontsource/jetbrains-mono/latin-700.css'

import { App } from './ui/App'
import './i18n'
import './styles/index.css'
import './styles/map.css'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element is missing')
}

ReactDOM.createRoot(root).render(
  <App />,
)
