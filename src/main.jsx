import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'


import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { ThemeProvider } from "./contexts/theme-context"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
