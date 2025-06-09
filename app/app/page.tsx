'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LogOut, BookOpen } from 'lucide-react'

export default function DashboardPage() {
  const { user, supabase, isLoading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </header>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.email}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You can manage all your meeting notes from here.</p>
            <Button onClick={() => router.push('/app/meetings')}>
              <BookOpen className="mr-2 h-4 w-4" /> View My Meetings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 