import { ThemeProvider } from "@/components/theme-provider"
import NavBar from "./components/NavBar"
import Collections from "./components/Collections"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <NavBar />
      <Collections />
    </ThemeProvider>
  )
}

export default App
