import { useState } from "react"
import { UploadCloud, Link as LinkIcon, Loader2 } from "lucide-react"
import { Button } from "../ui/Button"

interface UploadAreaProps {
  onUploadStart: (jobId: string) => void;
}

export function UploadArea({ onUploadStart }: UploadAreaProps) {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("http://127.0.0.1:5000/api/process_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onUploadStart(data.job_id)
    } catch (err: any) {
      setError(err.message || "Failed to process URL")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setLoading(true)
    setError("")
    
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://127.0.0.1:5000/api/upload", {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onUploadStart(data.job_id)
    } catch (err: any) {
      setError(err.message || "Failed to upload file")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 p-6 sm:p-10 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
      
      {/* URL Input */}
      <form onSubmit={handleUrlSubmit} className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input
            type="url"
            placeholder="Paste YouTube or video URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-12 pr-4 h-14 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-none text-slate-700 bg-slate-50/50"
            disabled={loading}
          />
        </div>
        <Button size="lg" type="submit" disabled={loading || !url.trim()} className="h-14 px-8 rounded-xl shrink-0">
          {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
          Summarize
        </Button>
      </form>

      <div className="relative flex items-center py-4">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-medium">OR</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Drag & Drop Area */}
      <div 
        className="mt-8 border-2 border-dashed border-slate-200 hover:border-primary-400 bg-slate-50/50 hover:bg-primary-50/50 rounded-2xl transition-colors duration-300 relative"
      >
        <input 
          type="file" 
          accept="video/*,audio/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileUpload}
          disabled={loading}
        />
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center pointer-events-none">
          <div className="h-16 w-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 text-primary-500">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">
            Drag & drop your video here
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Supports MP4, MOV, AVI, MP3 up to 2GB
          </p>
          <Button variant="outline" size="sm" className="pointer-events-none">
            Browse Files
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm text-center">
          {error}
        </div>
      )}
    </div>
  )
}
