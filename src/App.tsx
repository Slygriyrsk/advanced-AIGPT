/* import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Moon, Sun, Send, History, Trash, ImageIcon, Bot, Code, BarChart } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
//import { useToast } from "@/components/ui/use-toast"
import { useToast } from "./hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import CodeBlock from "./components/CodeBlock"
import DataVisualization from "./components/DataVisualization"
import Loading from "./components/Loading"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

function App() {
  const [question, setQuestion] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ type: string; content: string; timestamp: number }>>([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const { toast } = useToast()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File size exceeds limit",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setQuestion((prev) => prev + ` [File: ${file.name}]`)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const generateAnswer = async () => {
    if (!question.trim() && !selectedFile) return

    setLoading(true)
    const newQuestion = { type: "user", content: question, timestamp: Date.now() }

    try {
      if (selectedFile) {
        const base64File = await fileToBase64(selectedFile)
        // Handle file upload logic here
        newQuestion.content += ` (File: ${selectedFile.name})`
      }
      await processQuestion(newQuestion)
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Error",
        description: "Error processing file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "")
      reader.onerror = (error) => reject(error)
    })
  }

  const processQuestion = async (newQuestion: { type: string; content: string; timestamp: number }) => {
    setChatHistory((prev) => [...prev, newQuestion])
    setQuestion("")
    setSelectedFile(null)

    try {
      // Call Gemini API
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const result = await model.generateContent(newQuestion.content)
      const response = await result.response
      const text = response.text()

      const aiResponse = { type: "ai", content: text, timestamp: Date.now() }
      setChatHistory((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: `Error: ${error}`,
        variant: "destructive",
      })
      const errorResponse = {
        type: "ai",
        content: "An error occurred while generating the answer.",
        timestamp: Date.now(),
      }
      setChatHistory((prev) => [...prev, errorResponse])
    }
  }

  const deleteHistoryItem = (index: number) => {
    setChatHistory((prev) => {
      const newHistory = [...prev]
      newHistory.splice(index * 2, 2)
      return newHistory
    })
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme}`}>
      <header className="flex justify-between items-center p-4 border-b">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Bot className="w-8 h-8" />
          <h1 className="text-2xl font-bold">SABOT AI</h1>
        </motion.div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "light" ? (
                  <Moon className="h-[1.2rem] w-[1.2rem]" />
                ) : (
                  <Sun className="h-[1.2rem] w-[1.2rem]" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </header>

      <main className="container mx-auto p-4 grid gap-4 md:grid-cols-[1fr,300px]">
        <Card>
          <CardHeader>
            <CardTitle>Interactive AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="code">Code Generation</TabsTrigger>
                <TabsTrigger value="data">Data Visualization</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">
                <ScrollArea className="h-[60vh]" ref={chatContainerRef}>
                  <AnimatePresence>
                    {chatHistory.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-4 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <Avatar className="w-8 h-8 mr-2">
                            <AvatarImage src={message.type === "user" ? "/user-avatar.png" : "/ai-avatar.png"} />
                            <AvatarFallback>{message.type === "user" ? "U" : "AI"}</AvatarFallback>
                          </Avatar>
                          <div
                            className={`p-2 rounded-lg max-w-[80%] ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                          >
                            {message.content}
                            <div className="text-xs mt-1 opacity-50">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {loading && <Loading />}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="code">
                <CodeBlock />
              </TabsContent>
              <TabsContent value="data">
                <DataVisualization />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                generateAnswer()
              }}
              className="flex w-full space-x-2"
            >
              <div className="flex-grow relative">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything..."
                  className="pr-10"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={triggerFileInput}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload file</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button type="submit" disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Chat History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              <AnimatePresence>
                {chatHistory
                  .filter((msg) => msg.type === "user")
                  .map((chat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex justify-between items-center mb-2 p-2 bg-muted rounded-lg"
                    >
                      <span className="truncate flex-grow mr-2">{chat.content}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => deleteHistoryItem(index)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete item</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <footer className="text-center p-4 border-t">
        <p>&copy; {new Date().getFullYear()} SABOT AI. All rights reserved.</p>
      </footer>
      <Toaster />
    </div>
  )
}

export default App; */

// import type React from "react"
// import { useState, useRef, useEffect, useCallback } from "react"
// import {
//   Moon,
//   Sun,
//   Send,
//   History,
//   Trash,
//   ImageIcon,
//   Bot,
//   Code,
//   BarChart,
//   Settings,
//   Download,
//   Copy,
//   Share2,
//   RefreshCw,
//   Keyboard,
//   Info,
//   MessageSquarePlus,
//   ChevronDown,
// } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
// import { Button } from "@/components/ui/button"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { useToast } from "./hooks/use-toast"
// import { Toaster } from "@/components/ui/toaster"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
// import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
// import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import CodeBlock from "./components/CodeBlock"
// import DataVisualization from "./components/DataVisualization"
// import Loading from "./components/Loading"
// import { GoogleGenerativeAI } from "@google/generative-ai"
// import { Drawer } from "vaul"

// const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

// function App() {
//   const [question, setQuestion] = useState("")
//   const [chatHistory, setChatHistory] = useState<Array<{ type: string; content: string; timestamp: number }>>([])
//   const [loading, setLoading] = useState(false)
//   const [selectedFile, setSelectedFile] = useState<File | null>(null)
//   const [activeTab, setActiveTab] = useState("chat")
//   const [theme, setTheme] = useState<"light" | "dark">("dark")
//   const { toast } = useToast()
//   const chatContainerRef = useRef<HTMLDivElement>(null)
//   const fileInputRef = useRef<HTMLInputElement>(null)
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false)
//   const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
//   const [modelTemperature, setModelTemperature] = useState(0.7)
//   const [maxTokens, setMaxTokens] = useState(1000)

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
//     }
//   }, [chatHistory])

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", theme === "dark")
//   }, [theme])

//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
//         e.preventDefault()
//         document.querySelector<HTMLTextAreaElement>("textarea")?.focus()
//       }
//       if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
//         e.preventDefault()
//         setShowKeyboardShortcuts(true)
//       }
//     }

//     window.addEventListener("keydown", handleKeyPress)
//     return () => window.removeEventListener("keydown", handleKeyPress)
//   }, [])

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
//   }

//   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         toast({
//           title: "File size exceeds limit",
//           description: "Please upload a file smaller than 5MB.",
//           variant: "destructive",
//         })
//         return
//       }
//       setSelectedFile(file)
//       setQuestion((prev) => prev + ` [File: ${file.name}]`)
//     }
//   }

//   const triggerFileInput = () => {
//     fileInputRef.current?.click()
//   }

//   const generateAnswer = async () => {
//     if (!question.trim() && !selectedFile) return

//     setLoading(true)
//     const newQuestion = { type: "user", content: question, timestamp: Date.now() }

//     try {
//       if (selectedFile) {
//         const base64File = await fileToBase64(selectedFile)
//         // Handle file upload logic here
//         newQuestion.content += ` (File: ${selectedFile.name})`
//       }
//       await processQuestion(newQuestion)
//     } catch (error) {
//       console.error("Error processing file:", error)
//       toast({
//         title: "Error",
//         description: "Error processing file. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fileToBase64 = (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader()
//       reader.readAsDataURL(file)
//       reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "")
//       reader.onerror = (error) => reject(error)
//     })
//   }

//   const processQuestion = async (newQuestion: { type: string; content: string; timestamp: number }) => {
//     setChatHistory((prev) => [...prev, newQuestion])
//     setQuestion("")
//     setSelectedFile(null)

//     try {
//       const model = genAI.getGenerativeModel({
//         model: "gemini-pro",
//         temperature: modelTemperature,
//         maxOutputTokens: maxTokens,
//       })
//       const result = await model.generateContent(newQuestion.content)
//       const response = await result.response
//       const text = response.text()

//       const aiResponse = { type: "ai", content: text, timestamp: Date.now() }
//       setChatHistory((prev) => [...prev, aiResponse])
//     } catch (error) {
//       console.error("Error fetching data:", error)
//       toast({
//         title: "Error",
//         description: `Error: ${error}`,
//         variant: "destructive",
//       })
//       const errorResponse = {
//         type: "ai",
//         content: "An error occurred while generating the answer.",
//         timestamp: Date.now(),
//       }
//       setChatHistory((prev) => [...prev, errorResponse])
//     }
//   }

//   const deleteHistoryItem = (index: number) => {
//     setChatHistory((prev) => {
//       const newHistory = [...prev]
//       newHistory.splice(index * 2, 2)
//       return newHistory
//     })
//   }

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text)
//       toast({
//         title: "Copied to clipboard",
//         description: "The message has been copied to your clipboard.",
//       })
//     } catch (err) {
//       toast({
//         title: "Failed to copy",
//         description: "Please try again or copy manually.",
//         variant: "destructive",
//       })
//     }
//   }

//   const exportChat = () => {
//     const chatData = JSON.stringify(chatHistory, null, 2)
//     const blob = new Blob([chatData], { type: "application/json" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = `chat-export-${new Date().toISOString()}.json`
//     document.body.appendChild(a)
//     a.click()
//     document.body.removeChild(a)
//     URL.revokeObjectURL(url)
//   }

//   const clearChat = () => {
//     setChatHistory([])
//     toast({
//       title: "Chat cleared",
//       description: "All messages have been removed.",
//     })
//   }

//   return (
//     <div className={`min-h-screen bg-background text-foreground ${theme}`}>
//       <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50">
//         <motion.div
//           className="flex items-center space-x-2"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Bot className="w-8 h-8" />
//           <div className="flex flex-col">
//             <h1 className="text-2xl font-bold">SABOT AI</h1>
//             <Badge variant="outline" className="text-xs">
//               Beta
//             </Badge>
//           </div>
//         </motion.div>
//         <div className="flex items-center space-x-2">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="outline" size="icon" onClick={() => setShowKeyboardShortcuts(true)}>
//                   <Keyboard className="h-4 w-4" />
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Keyboard shortcuts (⌘K)</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//           <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
//             <SheetTrigger asChild>
//               <Button variant="outline" size="icon">
//                 <Settings className="h-4 w-4" />
//               </Button>
//             </SheetTrigger>
//             <SheetContent>
//               <SheetHeader>
//                 <SheetTitle>Settings</SheetTitle>
//               </SheetHeader>
//               <div className="py-4 space-y-4">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Model Temperature</label>
//                   <input
//                     type="range"
//                     min="0"
//                     max="1"
//                     step="0.1"
//                     value={modelTemperature}
//                     onChange={(e) => setModelTemperature(Number.parseFloat(e.target.value))}
//                     className="w-full"
//                   />
//                   <div className="text-xs text-muted-foreground">
//                     Current: {modelTemperature} (Higher = more creative)
//                   </div>
//                 </div>
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium">Max Tokens</label>
//                   <input
//                     type="range"
//                     min="100"
//                     max="2000"
//                     step="100"
//                     value={maxTokens}
//                     onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
//                     className="w-full"
//                   />
//                   <div className="text-xs text-muted-foreground">Current: {maxTokens}</div>
//                 </div>
//               </div>
//             </SheetContent>
//           </Sheet>
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button variant="ghost" size="icon" onClick={toggleTheme}>
//                   {theme === "light" ? (
//                     <Moon className="h-[1.2rem] w-[1.2rem]" />
//                   ) : (
//                     <Sun className="h-[1.2rem] w-[1.2rem]" />
//                   )}
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Toggle theme</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       </header>

//       <main className="container mx-auto p-4 grid gap-4 md:grid-cols-[1fr,300px]">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between">
//             <CardTitle>Interactive AI Assistant</CardTitle>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon">
//                   <ChevronDown className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={clearChat}>
//                   <RefreshCw className="h-4 w-4 mr-2" />
//                   Clear Chat
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={exportChat}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Export Chat
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </CardHeader>
//           <CardContent>
//             <Tabs value={activeTab} onValueChange={setActiveTab}>
//               <TabsList className="grid w-full grid-cols-3">
//                 <TabsTrigger value="chat">Chat</TabsTrigger>
//                 <TabsTrigger value="code">Code Generation</TabsTrigger>
//                 <TabsTrigger value="data">Data Visualization</TabsTrigger>
//               </TabsList>
//               <TabsContent value="chat">
//                 <ScrollArea className="h-[60vh]" ref={chatContainerRef}>
//                   <AnimatePresence>
//                     {chatHistory.map((message, index) => (
//                       <motion.div
//                         key={index}
//                         initial={{ opacity: 0, y: 20 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         exit={{ opacity: 0, y: -20 }}
//                         transition={{ duration: 0.3 }}
//                         className={`mb-4 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
//                       >
//                         <div
//                           className={`flex items-start ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
//                         >
//                           <Avatar className="w-8 h-8 mr-2">
//                             <AvatarImage src={message.type === "user" ? "/user-avatar.png" : "/ai-avatar.png"} />
//                             <AvatarFallback>{message.type === "user" ? "U" : "AI"}</AvatarFallback>
//                           </Avatar>
//                           <div
//                             className={`p-2 rounded-lg max-w-[80%] ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
//                           >
//                             {message.content}
//                             <div className="text-xs mt-1 opacity-50">
//                               {new Date(message.timestamp).toLocaleTimeString()}
//                             </div>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </AnimatePresence>
//                   {loading && <Loading />}
//                 </ScrollArea>
//               </TabsContent>
//               <TabsContent value="code">
//                 <CodeBlock />
//               </TabsContent>
//               <TabsContent value="data">
//                 <DataVisualization />
//               </TabsContent>
//             </Tabs>
//           </CardContent>
//           <CardFooter>
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault()
//                 generateAnswer()
//               }}
//               className="flex w-full space-x-2"
//             >
//               <div className="flex-grow relative">
//                 <Textarea
//                   value={question}
//                   onChange={(e) => setQuestion(e.target.value)}
//                   placeholder="Ask anything... (⌘ + /)"
//                   className="pr-10"
//                 />
//                 <div className="absolute right-2 top-2 flex space-x-1">
//                   <TooltipProvider>
//                     <Tooltip>
//                       <TooltipTrigger asChild>
//                         <Button type="button" variant="ghost" size="icon" onClick={triggerFileInput}>
//                           <ImageIcon className="h-4 w-4" />
//                         </Button>
//                       </TooltipTrigger>
//                       <TooltipContent>
//                         <p>Upload file</p>
//                       </TooltipContent>
//                     </Tooltip>
//                   </TooltipProvider>
//                   <TooltipProvider>
//                     <Tooltip>
//                       <TooltipTrigger asChild>
//                         <Button type="button" variant="ghost" size="icon" onClick={() => setQuestion("")}>
//                           <RefreshCw className="h-4 w-4" />
//                         </Button>
//                       </TooltipTrigger>
//                       <TooltipContent>
//                         <p>Clear input</p>
//                       </TooltipContent>
//                     </Tooltip>
//                   </TooltipProvider>
//                 </div>
//               </div>
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//                 className="hidden"
//                 accept="image/*,.pdf,.doc,.docx,.txt"
//               />
//               <Button type="submit" disabled={loading}>
//                 <Send className="h-4 w-4 mr-2" />
//                 Send
//               </Button>
//             </form>
//           </CardFooter>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <History className="w-5 h-5 mr-2" />
//                 Chat History
//               </div>
//               <HoverCard>
//                 <HoverCardTrigger asChild>
//                   <Button variant="ghost" size="icon">
//                     <Info className="h-4 w-4" />
//                   </Button>
//                 </HoverCardTrigger>
//                 <HoverCardContent>Right-click on any message to see more options</HoverCardContent>
//               </HoverCard>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ScrollArea className="h-[70vh]">
//               <AnimatePresence>
//                 {chatHistory
//                   .filter((msg) => msg.type === "user")
//                   .map((chat, index) => (
//                     <ContextMenu key={index}>
//                       <ContextMenuTrigger>
//                         <motion.div
//                           initial={{ opacity: 0, x: -20 }}
//                           animate={{ opacity: 1, x: 0 }}
//                           exit={{ opacity: 0, x: 20 }}
//                           transition={{ duration: 0.3 }}
//                           className="flex justify-between items-center mb-2 p-2 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
//                         >
//                           <span className="truncate flex-grow mr-2">{chat.content}</span>
//                           <TooltipProvider>
//                             <Tooltip>
//                               <TooltipTrigger asChild>
//                                 <Button variant="ghost" size="icon" onClick={() => deleteHistoryItem(index)}>
//                                   <Trash className="h-4 w-4" />
//                                 </Button>
//                               </TooltipTrigger>
//                               <TooltipContent>
//                                 <p>Delete item</p>
//                               </TooltipContent>
//                             </Tooltip>
//                           </TooltipProvider>
//                         </motion.div>
//                       </ContextMenuTrigger>
//                       <ContextMenuContent>
//                         <ContextMenuItem onClick={() => copyToClipboard(chat.content)}>
//                           <Copy className="h-4 w-4 mr-2" />
//                           Copy
//                         </ContextMenuItem>
//                         <ContextMenuItem>
//                           <Share2 className="h-4 w-4 mr-2" />
//                           Share
//                         </ContextMenuItem>
//                         <ContextMenuItem onClick={() => deleteHistoryItem(index)}>
//                           <Trash className="h-4 w-4 mr-2" />
//                           Delete
//                         </ContextMenuItem>
//                       </ContextMenuContent>
//                     </ContextMenu>
//                   ))}
//               </AnimatePresence>
//             </ScrollArea>
//           </CardContent>
//         </Card>
//       </main>

//       <Sheet open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
//         <SheetContent side="bottom" className="h-96">
//           <SheetHeader>
//             <SheetTitle>Keyboard Shortcuts</SheetTitle>
//           </SheetHeader>
//           <div className="grid grid-cols-2 gap-4 p-4">
//             <div>
//               <h3 className="font-semibold mb-2">General</h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span>Focus chat input</span>
//                   <kbd className="px-2 py-1 bg-muted rounded">⌘ + /</kbd>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Show shortcuts</span>
//                   <kbd className="px-2 py-1 bg-muted rounded">⌘ + K</kbd>
//                 </div>
//               </div>
//             </div>
//             <div>
//               <h3 className="font-semibold mb-2">Chat</h3>
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span>Send message</span>
//                   <kbd className="px-2 py-1 bg-muted rounded">↵</kbd>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Clear input</span>
//                   <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </SheetContent>
//       </Sheet>

//       <footer className="text-center p-4 border-t">
//         <p>&copy; {new Date().getFullYear()} SABOT AI. All rights reserved.</p>
//       </footer>
//       <Toaster />
//     </div>
//   )
// }

// export default App

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { Moon, Sun, Send, History, Trash, ImageIcon, Bot, Code, BarChart, Settings, Download, Copy, Share2, RefreshCw, Keyboard, Info, MessageSquarePlus, ChevronDown, Bug } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "./hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import CodeBlock from "./components/CodeBlock"
import DataVisualization from "./components/DataVisualization"
import Loading from "./components/Loading"
import Debugger from "./components/Debugger"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Drawer } from "vaul"

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

function App() {
  const [question, setQuestion] = useState("")
  const [chatHistory, setChatHistory] = useState<Array<{ type: string; content: string; timestamp: number }>>([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("chat")
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const { toast } = useToast()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [modelTemperature, setModelTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1000)
  const [showDebugger, setShowDebugger] = useState(false)

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        document.querySelector<HTMLTextAreaElement>("textarea")?.focus()
      }
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }
      if (e.key === "d" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault()
        setShowDebugger(prev => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File size exceeds limit",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        })
        return
      }
      setSelectedFile(file)
      setQuestion((prev) => prev + ` [File: ${file.name}]`)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const generateAnswer = async () => {
    if (!question.trim() && !selectedFile) return

    setLoading(true)
    const newQuestion = { type: "user", content: question, timestamp: Date.now() }

    try {
      if (selectedFile) {
        const base64File = await fileToBase64(selectedFile)
        // Handle file upload logic here
        newQuestion.content += ` (File: ${selectedFile.name})`
      }
      await processQuestion(newQuestion)
    } catch (error) {
      console.error("Error processing file:", error)
      toast({
        title: "Error",
        description: "Error processing file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result?.toString().split(",")[1] || "")
      reader.onerror = (error) => reject(error)
    })
  }

  const processQuestion = async (newQuestion: { type: string; content: string; timestamp: number }) => {
    setChatHistory((prev) => [...prev, newQuestion])
    setQuestion("")
    setSelectedFile(null)

    try {
      // Call Gemini API
      // const model = genAI.getGenerativeModel({
      //   model: "gemini-pro",
      //   temperature: modelTemperature,
      //   maxOutputTokens: maxTokens,
      // })
      const model = genAI.getGenerativeModel({
        model: "gemini-pro",
        generationConfig: {
          temperature: modelTemperature, // Ensure this property exists in 'generationConfig'
          maxOutputTokens: maxTokens
        }
      });      
      const result = await model.generateContent(newQuestion.content)
      const response = await result.response
      const text = response.text()

      const aiResponse = { type: "ai", content: text, timestamp: Date.now() }
      setChatHistory((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: `Error: ${error}`,
        variant: "destructive",
      })
      const errorResponse = {
        type: "ai",
        content: "An error occurred while generating the answer.",
        timestamp: Date.now(),
      }
      setChatHistory((prev) => [...prev, errorResponse])
    }
  }

  const deleteHistoryItem = (index: number) => {
    setChatHistory((prev) => {
      const newHistory = [...prev]
      newHistory.splice(index * 2, 2)
      return newHistory
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: "The message has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      })
    }
  }

  const exportChat = () => {
    const chatData = JSON.stringify(chatHistory, null, 2)
    const blob = new Blob([chatData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-export-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearChat = () => {
    setChatHistory([])
    toast({
      title: "Chat cleared",
      description: "All messages have been removed.",
    })
  }

  // Debug state object
  const debugState = {
    question,
    chatHistoryLength: chatHistory.length,
    loading,
    selectedFile: selectedFile?.name || null,
    activeTab,
    theme,
    modelTemperature,
    maxTokens,
  }

  // Debug actions
  const debugActions = {
    toggleTheme,
    clearChat,
    exportChat,
    "Log Chat History": () => console.log(chatHistory),
    "Test Error": () => console.error("Test error message"),
  }

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme}`}>
      <header className="flex justify-between items-center p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <motion.div
          className="flex items-center space-x-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Bot className="w-8 h-8" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">SABOT AI</h1>
            <Badge variant="outline" className="text-xs">
              Beta
            </Badge>
          </div>
        </motion.div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowDebugger(prev => !prev)}>
                  <Bug className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Debugger (⌘+Shift+D)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowKeyboardShortcuts(true)}>
                  <Keyboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Keyboard shortcuts (⌘K)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Settings</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model Temperature</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={modelTemperature}
                    onChange={(e) => setModelTemperature(Number.parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Current: {modelTemperature} (Higher = more creative)
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Tokens</label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number.parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">Current: {maxTokens}</div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme}>
                  {theme === "light" ? (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                  ) : (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <main className="container mx-auto p-4 grid gap-4 md:grid-cols-[1fr,300px]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Interactive AI Assistant</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={clearChat}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportChat}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="code">Code Generation</TabsTrigger>
                <TabsTrigger value="data">Data Visualization</TabsTrigger>
              </TabsList>
              <TabsContent value="chat">
                <ScrollArea className="h-[60vh]" ref={chatContainerRef}>
                  <AnimatePresence>
                    {chatHistory.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className={`mb-4 flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <Avatar className="w-8 h-8 mr-2">
                            <AvatarImage src={message.type === "user" ? "/user-avatar.png" : "/ai-avatar.png"} />
                            <AvatarFallback>{message.type === "user" ? "U" : "AI"}</AvatarFallback>
                          </Avatar>
                          <div
                            className={`p-2 rounded-lg max-w-[80%] ${message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                          >
                            {message.content}
                            <div className="text-xs mt-1 opacity-50">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {loading && <Loading />}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="code">
                <CodeBlock />
              </TabsContent>
              <TabsContent value="data">
                <DataVisualization />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                generateAnswer()
              }}
              className="flex w-full space-x-2"
            >
              <div className="flex-grow relative">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything... (⌘ + /)"
                  className="pr-10"
                />
                <div className="absolute right-2 top-2 flex space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" onClick={triggerFileInput}>
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload file</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button type="button" variant="ghost" size="icon" onClick={() => setQuestion("")}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Clear input</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button type="submit" disabled={loading}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <History className="w-5 h-5 mr-2" />
                Chat History
              </div>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent>Right-click on any message to see more options</HoverCardContent>
              </HoverCard>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh]">
              <AnimatePresence>
                {chatHistory
                  .filter((msg) => msg.type === "user")
                  .map((chat, index) => (
                    <ContextMenu key={index}>
                      <ContextMenuTrigger>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                          className="flex justify-between items-center mb-2 p-2 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer"
                        >
                          <span className="truncate flex-grow mr-2">{chat.content}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => deleteHistoryItem(index)}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete item</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </motion.div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem onClick={() => copyToClipboard(chat.content)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </ContextMenuItem>
                        <ContextMenuItem onClick={() => deleteHistoryItem(index)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>

      <Sheet open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts}>
        <SheetContent side="bottom" className="h-96">
          <SheetHeader>
            <SheetTitle>Keyboard Shortcuts</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            <div>
              <h3 className="font-semibold mb-2">General</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Focus chat input</span>
                  <kbd className="px-2 py-1 bg-muted rounded">⌘ + /</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Show shortcuts</span>
                  <kbd className="px-2 py-1 bg-muted rounded">⌘ + K</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Toggle debugger</span>
                  <kbd className="px-2 py-1 bg-muted rounded">⌘ + Shift + D</kbd>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Chat</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Send message</span>
                  <kbd className="px-2 py-1 bg-muted rounded">↵</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Clear input</span>
                  <kbd className="px-2 py-1 bg-muted rounded">Esc</kbd>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {showDebugger && (
        <Debugger 
          state={debugState} 
          actions={debugActions}
        />
      )}

      <footer className="text-center p-4 border-t">
        <p>&copy; {new Date().getFullYear()} SABOT AI. All rights reserved.</p>
      </footer>
      <Toaster />
    </div>
  )
}

export default App