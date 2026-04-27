import { useState, useEffect } from 'react'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { UploadArea } from './components/ui/UploadArea'
import { FeaturesSection } from './components/features/FeaturesSection'
import { ProcessingStepper } from './components/ui/ProcessingStepper'
import { ResultsDisplay } from './components/results/ResultsDisplay'
import { Sparkles } from 'lucide-react'

type AppState = 'idle' | 'processing' | 'results'

function App() {
  const [appState, setAppState] = useState<AppState>('idle')
  const [jobId, setJobId] = useState<string | null>(null)
  const [jobStatus, setJobStatus] = useState<string>('')
  const [jobError, setJobError] = useState<string>('')
  const [resultData, setResultData] = useState<any>(null)

  const handleUploadStart = (newJobId: string) => {
    setJobId(newJobId)
    setAppState('processing')
    setJobStatus('downloading')
    setJobError('')
  }

  useEffect(() => {
    let intervalId: number;

    const pollStatus = async () => {
      if (!jobId || appState !== 'processing') return
      
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/status/${jobId}`)
        const data = await res.json()
        
        if (data.status) {
          setJobStatus(data.status)
          
          if (data.status === 'completed') {
            clearInterval(intervalId)
            fetchResults()
          } else if (data.status === 'error') {
            clearInterval(intervalId)
            setAppState('idle')
            setJobError(data.error || "An unknown processing error occurred on the server.")
          }
        }
      } catch (err) {
        console.error("Error polling status", err)
      }
    }

    const fetchResults = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/result/${jobId}`)
        const data = await res.json()
        if (!data.error) {
          setResultData(data)
          setAppState('results')
        }
      } catch (err) {
        console.error("Error fetching results", err)
      }
    }

    if (appState === 'processing') {
      intervalId = window.setInterval(pollStatus, 1500)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [appState, jobId])

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      
      <main className="flex-grow flex flex-col pb-16">
        
        {/* Dynamic Content Based on State */}
        {appState === 'idle' && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {/* Hero Section */}
            <section className="pt-20 pb-16 px-4 text-center w-full max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary-50 text-primary-600 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Next-Generation Video Analysis</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                Summarize any video into <br className="hidden md:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">
                  concise insights
                </span> using AI
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                Save hours of watching. Upload your video or paste a link to get an accurate, structured summary, key insights, and a full transcript in seconds.
              </p>
              
              {jobError && (
                <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
                  Oops! We couldn't process this video. {jobError}
                </div>
              )}

              <UploadArea onUploadStart={handleUploadStart} />
            </section>

            <FeaturesSection />
          </div>
        )}

        {appState === 'processing' && (
          <div className="flex-grow flex items-center justify-center px-4 w-full h-full min-h-[60vh]">
            <ProcessingStepper status={jobStatus} />
          </div>
        )}

        {appState === 'results' && resultData && (
          <div className="px-4 w-full">
            <ResultsDisplay data={resultData} />
            <div className="mt-12 flex justify-center pb-8">
               <button 
                 onClick={() => {
                   setAppState('idle')
                   setJobId(null)
                   setResultData(null)
                 }}
                 className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
               >
                 ← Summarize another video
               </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}

export default App
