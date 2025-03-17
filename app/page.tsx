import { Dashboard } from "@/components/dashboard"
import { initDB } from "@/db/dao"
export default function Home() {
initDB()
  return (
    <div className="min-h-screen bg-background">
      <Dashboard />
    </div>
  )
}

