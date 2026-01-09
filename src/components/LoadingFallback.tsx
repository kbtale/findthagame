import { useState, useEffect } from 'react'
import { Progress } from './ui/progress'

export const LoadingFallback = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 500
    const startTime = Date.now()
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)
      
      if (newProgress < 100) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }, [])

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-heading text-center">Loading FindThaGame...</h1>
        <Progress value={progress} />
      </div>
    </div>
  )
}
