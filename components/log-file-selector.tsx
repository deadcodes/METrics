"use client"

import { useRef } from "react"
import { FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LogFileSelectorProps {
  onDirectorySelect: (path: string) => void
}

export function LogFileSelector({ onDirectorySelect }: LogFileSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDirectorySelect = () => {
    if (inputRef.current) {
      // In a real browser environment, we'd use the File System Access API
      // For this demo, we'll simulate directory selection
      const mockPath = "/var/log/application"
      onDirectorySelect(mockPath)
    }
  }

  return (
    <div>
      <input
        type="file"
        id="directory-input"
        ref={inputRef}
        className="hidden"
        // In a real implementation, we'd use webkitdirectory and directory attributes
        // but they're not fully supported in all browsers
        onChange={handleDirectorySelect}
      />
      <Button onClick={() => inputRef.current?.click()}>
        <FolderOpen className="mr-2 h-4 w-4" />
        Select Directory
      </Button>
    </div>
  )
}

