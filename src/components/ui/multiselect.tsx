"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface MultiselectOption {
  value: string
  label: string
}

export interface MultiselectProps {
  /** Array of options to display */
  options: MultiselectOption[]
  /** Array of currently selected values */
  value: string[]
  /** Callback when selection changes */
  onValueChange: (value: string[]) => void
  /** Placeholder text when nothing is selected */
  placeholder?: string
  /** Placeholder text for the search input */
  searchPlaceholder?: string
  /** Text shown when no results match the search */
  emptyText?: string
  /** Additional class names for the trigger button */
  className?: string
  /** Whether the multiselect is disabled */
  disabled?: boolean
  /** Maximum items to show in the button label before truncating */
  maxDisplayItems?: number
}

export function Multiselect({
  options,
  value,
  onValueChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
  maxDisplayItems = 3,
}: MultiselectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)

  const displayText =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= maxDisplayItems
        ? selectedLabels.join(", ")
        : `${selectedLabels.slice(0, maxDisplayItems).join(", ")} +${selectedLabels.length - maxDisplayItems}`

  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onValueChange(value.filter((v) => v !== selectedValue))
    } else {
      onValueChange([...value, selectedValue])
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="noShadow"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <span className="truncate">{displayText}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 border-0" align="start">
        <Command className="**:data-[slot=command-input-wrapper]:h-11">
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup className="p-2 [&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <div
                    className="border-border pointer-events-none size-5 shrink-0 rounded-base border-2 transition-all select-none *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100"
                    data-selected={value.includes(option.value)}
                  >
                    <CheckIcon className="size-4 text-current" />
                  </div>
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
