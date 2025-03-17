"use client"

import { Check, ChevronsUpDown, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface UserSelectorProps {
  users: string[]
  selectedUser: string
  onUserChange: (user: string) => void
}

export function UserSelector({ users, selectedUser, onUserChange }: UserSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] text-foreground justify-between">
          {selectedUser === "all" ? (
            <>
              <Users className="mr-2 h-4 w-4" />
              All Users
            </>
          ) : selectedUser ? (
            <>
              <Users className="mr-2 h-4 w-4" />
              {selectedUser}
            </>
          ) : (
            "Select user..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search user..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onUserChange("all")
                  setOpen(false)
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", selectedUser === "all" ? "opacity-100" : "opacity-0")} />
                All Users
              </CommandItem>
              {users.map((user) => (
                <CommandItem
                  key={user}
                  value={user}
                  onSelect={() => {
                    onUserChange(user)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", selectedUser === user ? "opacity-100" : "opacity-0")} />
                  {user}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

