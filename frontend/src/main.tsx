import React from 'react'
import ReactDOM from 'react-dom/client'
import { Dashboard } from './Dashboard'
import './index.css' // We'll need to create this or ensure tailwind imports are here

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Dashboard />
    </React.StrictMode>,
)
