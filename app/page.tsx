import { Dashboard } from "@/components/dashboard"
import { getPathFromDB, initDB } from "@/db/dao"
export default async function Home() {
initDB()
const settings = await getPathFromDB()
  return (
    <div className="min-h-screen bg-background">
      <Dashboard dir={settings || ""}/>
    </div>
  )
}

