"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Loader2, LogOut } from 'lucide-react'

// Define a clear and correct Meeting type
interface Meeting {
  id: string;
  created_at: string;
  title: string;
  content: string;
  summary?: string;
}

export default function MeetingsPage() { // Renamed component for clarity
  const { user, supabase, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Redirect unauthenticated users
    if (!isAuthLoading && !user) {
      router.push('/auth/login');
      return;
    }

    // Fetch meetings for authenticated users
    if (user) {
      const fetchMeetings = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching meetings:', error);
        } else if (data) {
          setMeetings(data);
        }
        setIsLoading(false);
      };
      fetchMeetings();
    }
  }, [user, isAuthLoading, router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // Display a loading spinner while auth state or meetings are loading
  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Meetings</h1>
        <Button onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </header>
      
      <div className="mb-6">
        <Button onClick={() => router.push('/app/meetings/new')}>
          <PlusCircle className="mr-2 h-4 w-4" /> New Meeting Note
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <Card 
              key={meeting.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow" 
              onClick={() => router.push(`/app/meetings/${meeting.id}`)}
            >
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
                <CardDescription>
                  {new Date(meeting.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {meeting.summary || meeting.content}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">You haven't created any meeting notes yet.</p>
          </div>
        )}
      </div>
    </div>
  );
} 