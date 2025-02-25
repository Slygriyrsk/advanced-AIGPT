/* import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function CodeBlock() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [generatedCode, setGeneratedCode] = useState('')

  const handleGenerateCode = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Generate ${language} code for the following description: ${code}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setGeneratedCode(text);
    } catch (error) {
      console.error("Error generating code:", error);
      setGeneratedCode("An error occurred while generating the code.");
    }
  }

  return (
    <div className="space-y-4">
      <Textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Describe the code you want to generate..."
        className="h-32"
      />
      <div className="flex space-x-2">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleGenerateCode}>Generate Code</Button>
      </div>
      {generatedCode && (
        <ScrollArea className="h-64 w-full border rounded">
          <SyntaxHighlighter language={language} style={oneDark}>
            {generatedCode}
          </SyntaxHighlighter>
        </ScrollArea>
      )}
    </div>
  )
} */

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { motion } from "framer-motion"
//import { useToast } from "@/components/ui/use-toast"
import { useToast } from "@/hooks/use-toast"

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function CodeBlock() {
    const [code, setCode] = useState("")
    const [language, setLanguage] = useState("javascript")
    const [generatedCode, setGeneratedCode] = useState("")
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handleGenerateCode = async () => {
        if (!code.trim()) return

        setLoading(true)
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" })
            const prompt = `Generate ${language} code for the following description: ${code}`
            const result = await model.generateContent(prompt)
            const response = await result.response
            const generatedText = response.text()

            // Extract code from the generated text
            const codeRegex = /```[\s\S]*?\n([\s\S]*?)```/
            const match = generatedText.match(codeRegex)
            setGeneratedCode(match ? match[1].trim() : generatedText)
        } catch (error) {
            console.error("Error generating code:", error)
            toast({
                title: "Error",
                description: "Failed to generate code. Please try again.",
                variant: "destructive",
            })
            setGeneratedCode("An error occurred while generating the code.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Describe the code you want to generate..."
                className="h-32"
            />
            <div className="flex space-x-2">
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={handleGenerateCode} disabled={loading}>
                    {loading ? "Generating..." : "Generate Code"}
                </Button>
            </div>
            {generatedCode && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <ScrollArea className="h-64 w-full border rounded">
                        <SyntaxHighlighter language={language} style={oneDark}>
                            {generatedCode}
                        </SyntaxHighlighter>
                    </ScrollArea>
                </motion.div>
            )}
        </div>
    )
}  