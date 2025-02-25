import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface DataFilterProps {
  data: any[]
  columns: string[]
  onFilterChange: (filteredData: any[]) => void
}

export default function DataFilter({ data, columns, onFilterChange }: DataFilterProps) {
  const [filters, setFilters] = useState<{ column: string; value: string }[]>([])

  useEffect(() => {
    applyFilters()
  }, [filters]) // Removed unnecessary dependency: data

  const addFilter = () => {
    setFilters([...filters, { column: columns[0], value: "" }])
  }

  const removeFilter = (index: number) => {
    const newFilters = [...filters]
    newFilters.splice(index, 1)
    setFilters(newFilters)
  }

  const updateFilter = (index: number, field: "column" | "value", value: string) => {
    const newFilters = [...filters]
    newFilters[index][field] = value
    setFilters(newFilters)
  }

  const applyFilters = () => {
    const filteredData = data.filter((item) =>
      filters.every((filter) => String(item[filter.column]).toLowerCase().includes(filter.value.toLowerCase())),
    )
    onFilterChange(filteredData)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Filters</h3>
        <Button onClick={addFilter} variant="outline">
          Add Filter
        </Button>
      </div>
      {filters.map((filter, index) => (
        <div key={index} className="flex items-end space-x-2">
          <div className="space-y-2 flex-grow">
            <Label htmlFor={`filterColumn-${index}`}>Column</Label>
            <Select value={filter.column} onValueChange={(value) => updateFilter(index, "column", value)}>
              <SelectTrigger id={`filterColumn-${index}`}>
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                {columns.map((col) => (
                  <SelectItem key={col} value={col}>
                    {col}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 flex-grow">
            <Label htmlFor={`filterValue-${index}`}>Value</Label>
            <Input
              id={`filterValue-${index}`}
              value={filter.value}
              onChange={(e) => updateFilter(index, "value", e.target.value)}
              placeholder="Filter value"
            />
          </div>
          <Button onClick={() => removeFilter(index)} variant="destructive">
            Remove
          </Button>
        </div>
      ))}
    </div>
  )
}