"use client"

import { useState, useEffect, useRef } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DepartmentInputProps {
  value: string
  onChange: (value: string) => void
}

export default function DepartmentInput({ value, onChange }: DepartmentInputProps) {
  const [open, setOpen] = useState(false)
  const [departments, setDepartments] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load departments from localStorage
    const savedDepartments = localStorage.getItem("departments")
    if (savedDepartments) {
      setDepartments(JSON.parse(savedDepartments))
    }
  }, [])

  const handleSelect = (currentValue: string) => {
    onChange(currentValue)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value || "选择或输入部门"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="搜索部门..." value={value} onValueChange={onChange} ref={inputRef} />
          <CommandList>
            {departments.length > 0 && <CommandEmpty>未找到匹配部门，将创建新部门</CommandEmpty>}
            {departments.length > 0 && (
              <CommandGroup heading="历史部门">
                {departments.map((dept) => (
                  <CommandItem key={dept} value={dept} onSelect={() => handleSelect(dept)}>
                    <Check className={cn("mr-2 h-4 w-4", value === dept ? "opacity-100" : "opacity-0")} />
                    {dept}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
