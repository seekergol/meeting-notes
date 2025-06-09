'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';

interface Meeting {
  id: string;
  created_at: string;
  title: string;
  content: string;
  summary?: string;
}

export default function MeetingDetailsPage() {
  const { user, supabase, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth to be ready
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchMeeting = async () => {
      if (!id) return;

      setIsLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching meeting details:', error);
        setMeeting(null);
      } else {
        setMeeting(data);
      }
      setIsLoading(false);
    };

    fetchMeeting();
  }, [id, user, isAuthLoading, router, supabase]);

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-lg">Meeting not found or you do not have permission to view it.</p>
        <Button onClick={() => router.push('/app/meetings')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meetings
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <header className="mb-6">
        <Button onClick={() => router.push('/app/meetings')} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Meetings
        </Button>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{meeting.title}</CardTitle>
          <CardDescription>
            Meeting Date: {new Date(meeting.created_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          {meeting.summary && (
            <>
              <h2>Summary</h2>
              <p>{meeting.summary}</p>
            </>
          )}
          <h2>Full Content</h2>
          <div dangerouslySetInnerHTML={{ __html: meeting.content.replace(/\n/g, '<br />') }} />
        </CardContent>
      </Card>
    </div>
  );
} 