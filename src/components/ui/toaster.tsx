"use client"

import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((t) => (
        <div key={t.id} className="rounded-md border bg-white px-4 py-2 shadow">
          {t.title && <div className="text-sm font-semibold">{t.title}</div>}
          {t.description && <div className="text-xs text-slate-600">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}


