"use client"

import { motion, HTMLMotionProps } from "framer-motion"

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number
  duration?: number
  children: React.ReactNode
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.3,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
