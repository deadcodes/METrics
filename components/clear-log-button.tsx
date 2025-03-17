"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { clearUserLogFile } from "@/lib/file-actions"
import { useToast } from "@/components/ui/toast-context"

interface ClearLogButtonProps {
  username: string
  directory: string
  onSuccess: () => void
  disabled?: boolean
}

export function ClearLogButton({ username, directory, onSuccess, disabled = false }: ClearLogButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const { addToast } = useToast()

  const handleClearLog = async () => {
    if (!username || !directory) return

    setIsClearing(true)
    try {
      const success = await clearUserLogFile(directory, username)

      if (success) {
        addToast({
          title: "Log Cleared",
          description: `Successfully cleared log file for ${username}`,
          variant: "default",
        })
        onSuccess()
      } else {
        addToast({
          title: "Error",
          description: "Failed to clear log file. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error clearing log file:", error)
      addToast({
        title: "Error",
        description: "An unexpected error occurred while clearing the log file.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setIsDialogOpen(true)}
              disabled={disabled || !username}
              aria-label="Clear log file"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear log file for {username || "selected user"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Log File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the log file for <strong>{username}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearLog}
              disabled={isClearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isClearing ? "Clearing..." : "Clear Log"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

