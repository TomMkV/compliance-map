"use client"

import { useCallback, useState } from "react"

type Toast = { id: number; title?: string; description?: string }

let idCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++idCounter
    setToasts((prev) => [...prev, { id, ...t }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, 3000)
  }, [])

  return { toast, toasts }
}


