'use client'

import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-slate-800 group-[.toaster]:text-slate-100 group-[.toaster]:border-slate-700 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-slate-400',
          actionButton: 'group-[.toast]:bg-cyan-500 group-[.toast]:text-slate-900',
          cancelButton: 'group-[.toast]:bg-slate-700 group-[.toast]:text-slate-300',
          success: 'group-[.toaster]:bg-green-900/50 group-[.toaster]:border-green-800',
          error: 'group-[.toaster]:bg-red-900/50 group-[.toaster]:border-red-800',
          warning: 'group-[.toaster]:bg-yellow-900/50 group-[.toaster]:border-yellow-800',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
