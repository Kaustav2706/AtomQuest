"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

export default function DepartmentSelector({ defaultSelected = [] }: { defaultSelected?: string[] }) {
  const allDepartments = ['Engineering', 'Sales', 'Product', 'HR', 'Finance']
  const [selected, setSelected] = useState<string[]>(defaultSelected)

  const toggleDept = (dept: string) => {
    if (selected.includes(dept)) {
      setSelected(selected.filter(d => d !== dept))
    } else {
      setSelected([...selected, dept])
    }
  }

  const addAll = () => {
    if (selected.length === allDepartments.length) {
      setSelected([])
    } else {
      setSelected(allDepartments)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 pt-1">
        {allDepartments.map(dept => {
          const isSelected = selected.includes(dept)
          return (
            <Badge
              key={dept}
              variant={isSelected ? 'default' : 'outline'}
              className="cursor-pointer transition-colors select-none"
              onClick={() => toggleDept(dept)}
            >
              {dept}
            </Badge>
          )
        })}
        <Badge
          variant="secondary"
          className="cursor-pointer hover:bg-slate-200 transition-colors select-none"
          onClick={addAll}
        >
          {selected.length === allDepartments.length ? 'Clear All' : '+ Add All'}
        </Badge>
      </div>
      {/* Hidden input to submit the selected departments in form data */}
      <input type="hidden" name="departments" value={selected.join(',')} />
    </div>
  )
}
