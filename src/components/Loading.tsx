/* import { Loader2 } from 'lucide-react'

export default function Loading() {
  return <Loader2 className="mr-2 h-4 w-4 animate-spin" />
} */


import { motion } from "framer-motion"

export default function Loading() {
    return (
        <div className="flex justify-center items-center h-20">
            <motion.div
                className="w-4 h-4 bg-primary rounded-full mr-1"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                }}
                transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 0,
                }}
            />
            <motion.div
                className="w-4 h-4 bg-primary rounded-full mr-1"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                }}
                transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 0.2,
                }}
            />
            <motion.div
                className="w-4 h-4 bg-primary rounded-full"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1],
                }}
                transition={{
                    duration: 1,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                    ease: "easeInOut",
                    delay: 0.4,
                }}
            />
        </div>
    )
}