import { Button } from "@/components/ui/button"
import TaskList from "./components/TaskList"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <Button>Click me</Button>
      <TaskList />
    </div>
  )
}

export default App
