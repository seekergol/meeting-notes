'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getMeetingById } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft, FileText, Calendar, Building, BookOpen } from 'lucide-react';
import ProtectedRoute from '@/components/auth/protected-route';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Meeting = {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  content: string;
  department: string | null;
};

export default function MeetingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Number(params.id);

  useEffect(() => {
    const fetchMeeting = async () => {
      if (!user || !id) return;

      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error: fetchError } = await getMeetingById(id, user.id);
        
        if (fetchError) {
          throw new Error(fetchError.message);
        }

        if (!data) {
          throw new Error('找不到该会议记录，或您没有权限查看。');
        }

        setMeeting(data as Meeting);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isAuthLoading) {
        fetchMeeting();
    }
  }, [id, user, isAuthLoading]);

  const renderContent = () => {
    if (isLoading || isAuthLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTitle>加载失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!meeting) {
      return (
         <Alert>
          <AlertTitle>无数据</AlertTitle>
          <AlertDescription>找不到对应的会议数据。</AlertDescription>
        </Alert>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{meeting.title}</CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-4 mt-2">
             <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(meeting.created_at).toLocaleDateString()}</span>
             </div>
             {meeting.department && (
                <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{meeting.department}</span>
                </div>
             )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <BookOpen className="h-5 w-5" />
                    会议摘要
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">{meeting.summary}</p>
            </div>
            <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5" />
                    完整记录
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-md">{meeting.content}</p>
            </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 px-4 md:px-6 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回列表
        </Button>
        {renderContent()}
      </div>
    </ProtectedRoute>
  );
} 