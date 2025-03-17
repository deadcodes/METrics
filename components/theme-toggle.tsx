"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export function ThemeToggle() {
  const [darkMode, setSelector] = useState<boolean>(true)
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    if (darkMode) {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }, [darkMode])
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="text-foreground" variant="outline" size="icon" onClick={() => setSelector(!darkMode)}>
            {darkMode ? (<Sun className="h-[1.2rem] w-[1.2rem] transition-all" />) : (<Moon className="h-[1.2rem] w-[1.2rem] transition-all" />)}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch theme</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>


  )
}

