import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight, Bug, RefreshCw, X } from 'lucide-react'

interface DebuggerProps {
  state: Record<string, any>
  actions?: Record<string, () => void>
  logs?: string[]
  errors?: string[]
}

export default function Debugger({ state, actions = {}, logs = [], errors = [] }: DebuggerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("state")
  const [localLogs, setLocalLogs] = useState<string[]>(logs)
  const [localErrors, setLocalErrors] = useState<string[]>(errors)

  // Override console methods to capture logs
  React.useEffect(() => {
    const originalConsoleLog = console.log
    const originalConsoleError = console.error

    console.log = (...args) => {
      setLocalLogs((prev) => [...prev, args.map((arg) => JSON.stringify(arg)).join(" ")])
      originalConsoleLog(...args)
    }

    console.error = (...args) => {
      setLocalErrors((prev) => [...prev, args.map((arg) => JSON.stringify(arg)).join(" ")])
      originalConsoleError(...args)
    }

    return () => {
      console.log = originalConsoleLog
      console.error = originalConsoleError
    }
  }, [])

  const clearLogs = () => setLocalLogs([])
  const clearErrors = () => setLocalErrors([])

  const renderValue = (value: any) => {
    if (value === null) return <span className="text-muted-foreground">null</span>
    if (value === undefined) return <span className="text-muted-foreground">undefined</span>
    if (typeof value === "boolean") return <span className="text-blue-500">{value.toString()}</span>
    if (typeof value === "number") return <span className="text-amber-500">{value}</span>
    if (typeof value === "string") return <span className="text-green-500">"{value}"</span>
    if (Array.isArray(value)) {
      return (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center">
            <ChevronRight className="h-4 w-4 mr-1" />
            <span>Array({value.length})</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 border-l pl-2 mt-1">
            {value.map((item, i) => (
              <div key={i} className="flex">
                <span className="text-muted-foreground mr-2">{i}:</span>
                {renderValue(item)}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }
    if (typeof value === "object") {
      return (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center">
            <ChevronRight className="h-4 w-4 mr-1" />
            <span>Object</span>
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-4 border-l pl-2 mt-1">
            {Object.entries(value).map(([key, val]) => (
              <div key={key} className="flex">
                <span className="text-muted-foreground mr-2">{key}:</span>
                {renderValue(val)}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )
    }
    return <span>{String(value)}</span>
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 rounded-full"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between p-3">
        <CardTitle className="text-sm flex items-center">
          <Bug className="h-4 w-4 mr-2" />
          Debugger
        </CardTitle>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="state" className="flex-1">
              State
              <Badge variant="outline" className="ml-2">
                {Object.keys(state).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex-1">
              Actions
              <Badge variant="outline" className="ml-2">
                {Object.keys(actions).length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex-1">
              Logs
              <Badge variant="outline" className="ml-2">
                {localLogs.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="errors" className="flex-1">
              Errors
              <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                {localErrors.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="state" className="p-3">
            <ScrollArea className="h-64">
              {Object.entries(state).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="font-medium">{key}:</div>
                  <div className="ml-2">{renderValue(value)}</div>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="actions" className="p-3">
            <ScrollArea className="h-64">
              {Object.entries(actions).map(([key, action]) => (
                <div key={key} className="mb-2">
                  <Button variant="outline" size="sm" onClick={action} className="w-full justify-start">
                    {key}
                  </Button>
                </div>
              ))}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="logs" className="p-3">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" size="sm" onClick={clearLogs}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
            <ScrollArea className="h-64 border rounded-md p-2 bg-muted/20">
              {localLogs.map((log, i) => (
                <div key={i} className="text-xs font-mono mb-1">
                  {log}
                </div>
              ))}
              {localLogs.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No logs yet</div>
              )}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="errors" className="p-3">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" size="sm" onClick={clearErrors}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
            <ScrollArea className="h-64 border rounded-md p-2 bg-red-50 dark:bg-red-900/10">
              {localErrors.map((error, i) => (
                <div key={i} className="text-xs font-mono mb-1 text-red-600 dark:text-red-400">
                  {error}
                </div>
              ))}
              {localErrors.length === 0 && (
                <div className="text-xs text-muted-foreground italic">No errors yet</div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}