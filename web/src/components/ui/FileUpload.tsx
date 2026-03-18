'use client'

import { useState, useRef } from 'react'
import api from '@/lib/api'

interface Props {
  type: 'zip' | 'image'
  onUploaded: (result: { path: string; url: string; size: number }) => void
  label?: string
}

export default function FileUpload({ type, onUploaded, label }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const accept = type === 'zip' ? '.zip' : 'image/*'

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setFileName(file.name)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })

      onUploaded(data)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка загрузки')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {label && <label className="block text-white/30 text-[11px] font-semibold uppercase tracking-wider mb-1.5">{label}</label>}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full px-4 py-3 bg-white/[0.03] border border-dashed border-white/[0.1] rounded-xl text-sm text-white/30 hover:text-white/60 hover:border-accent/20 transition disabled:opacity-50 text-left"
      >
        {uploading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            {fileName} — {progress}%
          </span>
        ) : fileName ? (
          <span className="text-accent-light">✓ {fileName}</span>
        ) : (
          <span>Нажмите для загрузки {type === 'zip' ? '.zip файла' : 'изображения'}</span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  )
}
