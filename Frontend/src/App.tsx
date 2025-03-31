import { ThemeProvider } from "@/components/theme-provider"
import NavBar from "./components/NavBar"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <NavBar />
    </ThemeProvider>
  )
}

export default App
