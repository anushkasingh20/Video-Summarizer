import { useState } from "react"
import html2pdf from 'html2pdf.js'
import { Copy, Download, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"

interface ResultData {
  title: string;
  summary: string;
  transcript: string;
  video_url?: string;
}

interface ResultsDisplayProps {
  data: ResultData;
}

export function ResultsDisplay({ data }: ResultsDisplayProps) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)

  const copyToClipboard = () => {
    const text = `Title: ${data.title}\n\nSummary:\n${data.summary}\n\nTranscript:\n${data.transcript}`
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard!")
  }

  const downloadPDF = () => {
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="font-family: sans-serif; padding: 20px; color: #0f172a; max-width: 800px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
          ${data.title || "Video Summary"}
        </h1>
        
        <h2 style="font-size: 18px; font-weight: 600; margin-top: 24px; margin-bottom: 12px; color: #1e40af;">
          Executive Summary
        </h2>
        <div style="font-size: 14px; line-height: 1.6; color: #334155;">
          ${(data.summary || "No summary available.").replace(/\n/g, '<br/>')}
        </div>

        <h2 style="font-size: 18px; font-weight: 600; margin-top: 32px; margin-bottom: 12px; color: #1e40af; page-break-before: auto;">
          Full Transcript
        </h2>
        <div style="font-size: 12px; line-height: 1.6; color: #475569; white-space: pre-wrap;">
          ${data.transcript || "No transcript available."}
        </div>
      </div>
    `

    const safeTitle = data.title ? data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'video'
    
    const opt = {
      margin:       10,
      filename:     `${safeTitle}_summary.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf().set(opt).from(element).save()
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-10 space-y-8 animate-in fade-in duration-500">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">{data.title}</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button onClick={downloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Summary */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {data.summary ? (
                <ul className="space-y-3">
                  {data.summary.split('\n').filter(s => s.trim().length > 0).map((point, idx) => (
                    <li key={idx} className="flex items-start text-slate-700 leading-relaxed">
                      <span className="mr-3 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
                      <span className="whitespace-pre-wrap">{point.replace(/^[\s*-]+/, '')}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-100 text-slate-500 flex items-center justify-center italic text-center">
                  No transcribable speech or AI summary could be generated for this video.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcript Accordion */}
          <Card className="overflow-hidden transition-all duration-300">
            <button 
              className="w-full p-6 flex justify-between items-center bg-transparent border-none text-left"
              onClick={() => setTranscriptOpen(!transcriptOpen)}
            >
              <h3 className="text-xl font-semibold leading-none tracking-tight text-slate-950">
                Full Transcript
              </h3>
              {transcriptOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {transcriptOpen && (
              <div className="p-6 pt-0 text-slate-600 text-sm leading-relaxed whitespace-pre-wrap border-t border-slate-100">
                {data.transcript}
              </div>
            )}
          </Card>

        </div>

        {/* Sidebar: Video Player */}
        <div className="space-y-8">
          
          <div className="w-full aspect-video bg-slate-900 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden shadow-sm">
            {data.video_url ? (
              <video 
                src={data.video_url} 
                controls 
                className="w-full h-full object-cover rounded-xl"
              >
                Your browser does not support HTML5 video.
              </video>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <span>{data.title}</span>
              </div>
            )}
          </div>



        </div>

      </div>
    </div>
  )
}
