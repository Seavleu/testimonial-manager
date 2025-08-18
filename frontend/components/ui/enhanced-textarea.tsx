'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Bold, 
  Italic, 
  List, 
  Quote, 
  Undo, 
  Redo,
  Type
} from 'lucide-react'

interface EnhancedTextareaProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  label?: string
  error?: string
  className?: string
}

export function EnhancedTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 5,
  maxLength,
  label,
  error,
  className
}: EnhancedTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)

  // Save to history when value changes
  useEffect(() => {
    if (value !== history[historyIndex]) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(value)
      if (newHistory.length > 50) { // Limit history to 50 entries
        newHistory.shift()
      }
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }, [value])

  // Save cursor position
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target
    setSelectionStart(target.selectionStart)
    setSelectionEnd(target.selectionEnd)
    onChange(target.value)
  }

  // Formatting functions
  const insertText = (textToInsert: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = value.substring(0, start) + textToInsert + value.substring(end)
    
    onChange(newValue)
    
    // Set cursor position after inserted text
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(
          start + textToInsert.length,
          start + textToInsert.length
        )
      }
    }, 0)
  }

  const wrapSelection = (before: string, after: string = '') => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    if (selectedText) {
      const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)
      onChange(newValue)
      
      // Set cursor position after wrapped text
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(
            start + before.length,
            start + before.length + selectedText.length
          )
        }
      }, 0)
    } else {
      // No selection, just insert the formatting
      insertText(before + after)
      
      // Set cursor position between formatting
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(
            start + before.length,
            start + before.length
          )
        }
      }, 0)
    }
  }

  const formatBold = () => wrapSelection('**', '**')
  const formatItalic = () => wrapSelection('*', '*')
  const formatQuote = () => wrapSelection('> ')
  const formatBullet = () => wrapSelection('- ')

  // Undo/Redo functions
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      onChange(history[newIndex])
    }
  }

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
      )}
      
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-lg">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBold}
          className="h-8 w-8 p-0"
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatItalic}
          className="h-8 w-8 p-0"
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatQuote}
          className="h-8 w-8 p-0"
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={formatBullet}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 w-8 p-0"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 w-8 p-0"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />
        
        {maxLength && (
          <span className="text-xs text-gray-500">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      
      {/* Textarea */}
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={handleTextareaChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`${className || ''} rounded-t-none border-t-0 focus:border-t focus:border-blue-500 ${
          error ? 'border-red-500 focus:border-red-500' : ''
        }`}
      />
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-500 flex items-center">
          <span className="mr-1">⚠️</span>
          {error}
        </p>
      )}
      
      {/* Formatting Help */}
      <div className="text-xs text-gray-500 space-y-1">
        <p className="font-medium">Formatting shortcuts:</p>
        <div className="grid grid-cols-2 gap-2">
          <span>**bold** - Bold text</span>
          <span>*italic* - Italic text</span>
          <span>&gt; quote - Quote block</span>
          <span>- item - Bullet list</span>
        </div>
      </div>
    </div>
  )
}
