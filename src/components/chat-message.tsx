import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: {
    type: string
    content: string
    timestamp: number
  }
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn("mb-4 flex", message.type === "user" ? "justify-end" : "justify-start")}
    >
      <div className={cn("flex items-start gap-2 group", message.type === "user" ? "flex-row-reverse" : "flex-row")}>
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.type === "user" ? "/user-avatar.png" : "/ai-avatar.png"} />
          <AvatarFallback>{message.type === "user" ? "U" : "AI"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <div
            className={cn(
              "p-3 rounded-lg max-w-[80%] relative group",
              message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            {message.content}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={copyToClipboard}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">{format(message.timestamp, "HH:mm")}</span>
        </div>
      </div>
    </motion.div>
  )
}