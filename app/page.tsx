import { Dashboard } from "@/components/dashboard"
import { getPathFromDB, initDB } from "@/db/dao"
import { watchDropsFolder } from "@/lib/watchFiles";
export default async function Home() {
  initDB()
  const settings = await getPathFromDB()
  let isWatching = false;
  if (!isWatching) {
    watchDropsFolder(settings!);
    isWatching = true;
  }
  return (
    <div className="min-h-screen bg-background">
      <Dashboard dir={settings || ""} />
    </div>
  )
}

