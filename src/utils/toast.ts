import React from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

let toastCount = 0

export const showToast = ({ message, type = 'info', duration = 3000 }: ToastProps) => {
  const id = `toast-${toastCount++}`
  const toastElement = document.createElement('div')
  toastElement.id = id
  toastElement.className = `
    fixed bottom-4 right-4 p-4 rounded-lg font-semibold text-white z-50
    animate-fadeInUp
    ${type === 'success' && 'bg-green-500'}
    ${type === 'error' && 'bg-red-500'}
    ${type === 'info' && 'bg-blue-500'}
    ${type === 'warning' && 'bg-yellow-500'}
  `
  toastElement.textContent = message
  document.body.appendChild(toastElement)

  setTimeout(() => {
    toastElement.remove()
  }, duration)
}

export const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    showToast({ message: 'Copied to clipboard!', type: 'success' })
  } catch (err) {
    showToast({ message: 'Failed to copy', type: 'error' })
  }
}
