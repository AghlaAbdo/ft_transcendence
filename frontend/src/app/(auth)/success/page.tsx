'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthSuccess() {
  const router = useRouter()
  
  useEffect(() => {
    // Small delay to ensure cookies/tokens are properly set
    // const timer = setTimeout(() => {
      router.push('/home');
    // }, 0) // (1 second delay = 1000)
    
    // Cleanup timer
    // return () => clearTimeout(timer)
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p>Completing your login...</p>
      </div>
    </div>
  )
}