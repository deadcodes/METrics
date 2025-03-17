"use client"

import { Button } from "@/components/ui/button"

export type TimeRange = {
  label: string
  seconds: number
}

interface TimeRangeSelectorProps {
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
}

export function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  const timeRanges: TimeRange[] = [
    { label: "5 min", seconds: 300 },
    { label: "15 min", seconds: 900 },
    { label: "1 hour", seconds: 3600 },
    { label: "6 hours", seconds: 21600 },
    { label: "12 hours", seconds: 43200 },
    { label: "1 day", seconds: 86400 },
    { label: "All", seconds: 0 }, // 0 means all data
  ]

  return (
    <div className="flex flex-wrap gap-2 text-foreground">
      <span className="text-sm font-medium self-center mr-2">Time Range:</span>
      {timeRanges.map((range) => (
        <Button
          key={range.label}
          variant={selectedRange.seconds === range.seconds ? "default" : "outline"}
          size="sm"
          onClick={() => onRangeChange(range)}
          className="px-3 py-1 h-8"
        >
          {range.label}
        </Button>
      ))}
    </div>
  )
}

