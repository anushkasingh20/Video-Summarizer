import { Video } from "lucide-react"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold text-lg text-primary-600">
          <Video className="h-6 w-6" />
          <span>SummaAI</span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-slate-500 hover:text-slate-900 transition-colors font-medium border border-slate-200 px-4 py-1.5 rounded-full hover:bg-slate-50"
          >
            <span>Another Vid</span>
          </a>
        </div>
      </div>
    </nav>
  )
}
