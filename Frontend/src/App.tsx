import { ThemeProvider } from "@/components/theme-provider"
import Collections from "./components/Collections"
import { Routes, Route } from "react-router-dom";
import CollectionDetail from "./components/CollectionDetail";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">

      <Routes>
        <Route path="/" element={<Collections />} />
        <Route path="/collection/:id" element={<CollectionDetail />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
