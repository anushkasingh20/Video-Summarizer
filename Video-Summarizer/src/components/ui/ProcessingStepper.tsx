import { motion } from "framer-motion"
import { CheckCircle2, Loader2, Circle } from "lucide-react"

interface ProcessingStepperProps {
  status: string;
}

const STEPS = [
  { id: "downloading", label: "Downloading Video" },
  { id: "extracting_audio", label: "Extracting Audio" },
  { id: "chunking_audio", label: "Chunking Audio" },
  { id: "transcribing", label: "Transcribing Speech to Text" },
  { id: "chunking_text", label: "Preparing Text Segments" },
  { id: "summarizing", label: "Generating AI Summary" },
  { id: "completed", label: "Completed" }
]

export function ProcessingStepper({ status }: ProcessingStepperProps) {
  // Determine current active index based on backend status
  let currentIndex = STEPS.findIndex(s => s.id === status)
  
  // if job completed, put it at the very end
  if (status === "completed") currentIndex = STEPS.length - 1
  if (currentIndex === -1) currentIndex = 0


  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-sm border border-slate-100 mt-10">
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Processing Video</h2>
        <p className="text-slate-500">Our AI is doing the heavy lifting...</p>
      </div>

      <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
        {STEPS.filter(s => s.id !== "completed").map((step, idx) => {
          const isCompleted = currentIndex > STEPS.findIndex(s => s.id === step.id)
          const isCurrent = step.id === status
          
          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-8"
            >
              <div className={`absolute -left-[11px] bg-white p-0.5 rounded-full`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 bg-white" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-primary-500 animate-spin bg-white" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-200 bg-white" />
                )}
              </div>
              
              <h4 className={`text-lg font-medium transition-colors duration-300 ${isCurrent ? 'text-primary-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                {step.label}
              </h4>
              
              {isCurrent && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="mt-2 text-sm text-slate-500"
                >
                  This may take a few moments depending on the video length.
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
