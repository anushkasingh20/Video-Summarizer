import { Zap, BrainCircuit, Clock, Layers } from "lucide-react"

const features = [
  {
    title: "Fast Processing",
    description: "Get comprehensive summaries of long videos in a fraction of the time.",
    icon: Zap,
  },
  {
    title: "Accurate AI Summaries",
    description: "Powered by state-of-the-art AI to capture the most important insights.",
    icon: BrainCircuit,
  },
  {
    title: "Supports Long Videos",
    description: "No matter how long the lecture or meeting is, we can summarize it.",
    icon: Clock,
  },
  {
    title: "Multi-Format Support",
    description: "Upload local files or paste links directly from platforms like YouTube.",
    icon: Layers,
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white w-full">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Why use SummaAI?
          </h2>
          <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
            Our platform helps you extract knowledge faster, giving you concise insights without watching hours of footage.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
