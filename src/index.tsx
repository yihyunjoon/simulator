/* @refresh reload */
import 'solid-devtools'
import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

const root = document.getElementById('root')

render(() => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
), root!)
