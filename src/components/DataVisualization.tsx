/* import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from "@/components/ui/button"

export default function DataVisualization() {
  const [data, setData] = useState<Array<{name: string, value: number}>>([])

  const fetchData = async () => {
    // In a real application, you would fetch data from an API
    // For this example, we'll generate some dummy data
    const newData = Array.from({ length: 7 }, (_, i) => ({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 1000)
    }))
    setData(newData)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <Button onClick={fetchData}>Refresh Data</Button>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} */


/* import React, { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useToast } from "@/hooks/use-toast"
import { motion } from "framer-motion"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function DataVisualization() {
  const [data, setData] = useState([])
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const generateData = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent(
        `Generate JSON data for a line chart based on this prompt: ${prompt}. The data should be an array of objects with 'name' and 'value' properties.`,
      )
      const response = await result.response
      const generatedText = response.text()

      // Extract and parse JSON from the generated text
      const jsonRegex = /\{[\s\S]*\}/
      const match = generatedText.match(jsonRegex)
      if (match) {
        const jsonData = JSON.parse(match[0])
        setData(jsonData)
      } else {
        throw new Error("Failed to generate valid JSON data")
      }
    } catch (error) {
      console.error("Error generating data:", error)
      toast({
        title: "Error",
        description: "Failed to generate data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the data you want to visualize..."
        className="h-32"
      />
      <Button onClick={generateData} disabled={loading}>
        {loading ? "Generating..." : "Generate Data"}
      </Button>
      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-64"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
} */

/* import React, { useState } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, RefreshCw, Download } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const EXAMPLE_PROMPTS = [
  "Show me monthly sales data for the past year",
  "Generate temperature variations over 24 hours",
  "Show me website traffic data for the last 7 days",
  "Display stock price movement for a week",
]

interface DataPoint {
  name: string
  value: number
  [key: string]: string | number // For additional data points
}

export default function DataVisualization() {
  const [data, setData] = useState<DataPoint[]>([])
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [chartType, setChartType] = useState("line")
  const { toast } = useToast()

  const generateData = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for the data you want to visualize.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent(`
        Generate JSON data for a chart based on this prompt: ${prompt}. 
        The data should be an array of objects with 'name' and 'value' properties.
        Include at least 7 data points.
        Make sure the values are realistic and make sense for the context.
        Format the response as valid JSON only.
      `)

      const response = await result.response
      const generatedText = response.text()

      // Extract and parse JSON from the generated text
      const jsonRegex = /\[[\s\S]*\]/
      const match = generatedText.match(jsonRegex)
      if (match) {
        const jsonData = JSON.parse(match[0])
        setData(jsonData)
        toast({
          title: "Data generated",
          description: "Chart data has been generated successfully.",
        })
      } else {
        throw new Error("Failed to generate valid JSON data")
      }
    } catch (error) {
      console.error("Error generating data:", error)
      toast({
        title: "Error",
        description: "Failed to generate data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadData = () => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chart-data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearData = () => {
    setData([])
    setPrompt("")
    toast({
      title: "Data cleared",
      description: "Chart data and prompt have been cleared.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-grow">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the data you want to visualize..."
                  className="h-32"
                />
              </div>
              <div className="space-y-2">
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={generateData} disabled={loading} className="flex-grow">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Data"
                )}
              </Button>
              <Button variant="outline" onClick={clearData} disabled={loading}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear
              </Button>
              {data.length > 0 && (
                <Button variant="outline" onClick={downloadData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {EXAMPLE_PROMPTS.map((examplePrompt) => (
                <Button
                  key={examplePrompt}
                  variant="secondary"
                  size="sm"
                  onClick={() => setPrompt(examplePrompt)}
                  className="text-xs"
                >
                  {examplePrompt}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {data.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="h-[400px]">
                  <ChartContainer
                    config={{
                      value: {
                        label: "Value",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="name" className="text-sm" tickLine={false} axisLine={false} />
                        <YAxis
                          className="text-sm"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="var(--color-value)"
                          strokeWidth={2}
                          dot={{ strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} */

/* import { useState, useEffect } from "react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Download } from "lucide-react"
import Papa from "papaparse"

const DATASETS = {
  leukemia_risk: "/src/data/leukemia_risk.csv",
  // Add more datasets here as needed
} as const

type Dataset = keyof typeof DATASETS

interface DataPoint {
  [key: string]: string | number
}

export default function DataVisualization() {
  const [data, setData] = useState<DataPoint[]>([])
  const [dataset, setDataset] = useState<Dataset>("leukemia_risk")
  const [chartType, setChartType] = useState<"line" | "bar" | "scatter">("line")
  const [xAxis, setXAxis] = useState("")
  const [yAxis, setYAxis] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData(dataset)
  }, [dataset])

  const loadData = async (selectedDataset: Dataset) => {
    setLoading(true)
    try {
      const response = await fetch(DATASETS[selectedDataset])
      const csvData = await response.text()
      const results = Papa.parse<DataPoint>(csvData, { header: true, dynamicTyping: true })
      setData(results.data)

      // Set default axes
      const columns = Object.keys(results.data[0] || {})
      setXAxis(columns[0] || "")
      setYAxis(columns[1] || "")

      toast({
        title: "Data loaded",
        description: `${selectedDataset} data has been loaded successfully.`,
      })
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadData = () => {
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${dataset}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderChart = () => {
    const ChartComponent = chartType === "bar" ? BarChart : chartType === "scatter" ? ScatterChart : LineChart
    const DataComponent = chartType === "bar" ? Bar : chartType === "scatter" ? Scatter : Line

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxis} />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent type="monotone" dataKey={yAxis} stroke="var(--chart-1)" fill="var(--chart-1)" />
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Visualization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Select value={dataset} onValueChange={(value: Dataset) => setDataset(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(DATASETS) as Dataset[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {key.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={chartType} onValueChange={(value: "line" | "bar" | "scatter") => setChartType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="scatter">Scatter Plot</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadData} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="flex space-x-2">
          <Select value={xAxis} onValueChange={setXAxis}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select X-axis" />
            </SelectTrigger>
            <SelectContent>
              {data[0] &&
                Object.keys(data[0]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Select value={yAxis} onValueChange={setYAxis}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Y-axis" />
            </SelectTrigger>
            <SelectContent>
              {data[0] &&
                Object.keys(data[0]).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <motion.div
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  )
} */

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Moon, Sun } from "lucide-react"
import Papa from "papaparse"
import { useTheme } from "next-themes"
import DataFilter from "./DataFilter"
import CustomTooltip from "./CustomTooltip"

const DATASETS = {
  leukemia_risk: "/src/data/leukemia_risk.csv",
  // Abhi aur add krna hai
} as const

type Dataset = keyof typeof DATASETS

interface DataPoint {
  [key: string]: string | number
}

export default function DataVisualization() {
  const [data, setData] = useState<DataPoint[]>([])
  const [filteredData, setFilteredData] = useState<DataPoint[]>([])
  const [dataset, setDataset] = useState<Dataset>("leukemia_risk")
  const [chartType, setChartType] = useState<"line" | "bar" | "scatter">("line")
  const [xAxis, setXAxis] = useState("")
  const [yAxis, setYAxis] = useState("")
  const [loading, setLoading] = useState(false)
  const [columns, setColumns] = useState<string[]>([])
  const [chartColor, setChartColor] = useState("#8884d8")
  const [showGridLines, setShowGridLines] = useState(true)
  const [chartOpacity, setChartOpacity] = useState(100)
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    loadData(dataset)
  }, [dataset])

  const loadData = async (selectedDataset: Dataset) => {
    setLoading(true)
    try {
      const response = await fetch(DATASETS[selectedDataset])
      const csvData = await response.text()
      // const results = Papa.parse<DataPoint>(csvData, { header: true, dynamicTyping: true })
      const results = Papa.parse(csvData, { header: true, dynamicTyping: true }) as Papa.ParseResult<DataPoint>;
      setData(results.data)
      setFilteredData(results.data)

      const cols = Object.keys(results.data[0] || {})
      setColumns(cols)
      setXAxis(cols[0] || "")
      setYAxis(cols[1] || "")

      toast({
        title: "Data loaded",
        description: `${selectedDataset} data has been loaded successfully.`,
      })
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const downloadData = () => {
    const csv = Papa.unparse(filteredData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${dataset}_filtered.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderChart = () => {
    const ChartComponent = chartType === "bar" ? BarChart : chartType === "scatter" ? ScatterChart : LineChart
    const DataComponent = chartType === "bar" ? Bar : chartType === "scatter" ? Scatter : Line

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ChartComponent data={filteredData}>
          {showGridLines && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxis} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey={yAxis}
            stroke={chartColor}
            fill={chartColor}
            fillOpacity={chartOpacity / 100}
          />
        </ChartComponent>
      </ResponsiveContainer>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Data Visualization</CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="chart" className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Select value={dataset} onValueChange={(value: Dataset) => setDataset(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select dataset" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(DATASETS) as Dataset[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={chartType} onValueChange={(value: "line" | "bar" | "scatter") => setChartType(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="scatter">Scatter Plot</SelectItem>
                </SelectContent>
              </Select>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select X-axis" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Y-axis" />
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
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center items-center h-[400px]"
                >
                  <motion.div
                    className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  />
                </motion.div>
              ) : (
                <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderChart()}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chartColor">Chart Color</Label>
              <Input id="chartColor" type="color" value={chartColor} onChange={(e) => setChartColor(e.target.value)} />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="showGridLines" checked={showGridLines} onCheckedChange={setShowGridLines} />
              <Label htmlFor="showGridLines">Show Grid Lines</Label>
            </div>
            <div className="space-y-2">
              <Label>Chart Opacity</Label>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[chartOpacity]}
                onValueChange={(value) => setChartOpacity(value[0])}
              />
            </div>
          </TabsContent>
        </Tabs>
        <DataFilter data={data} columns={columns} onFilterChange={setFilteredData} />
        <div className="flex justify-end">
          <Button onClick={downloadData} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Export Filtered Data
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}