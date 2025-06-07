"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { signOut, getMeetings, addMeeting } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus, LogOut, FileText, Search } from 'lucide-react'
import ProtectedRoute from '@/components/auth/protected-route'
import SpeechRecognition from '@/components/speech-recognition'
import FreeAudioTranscriber from '@/components/free-audio-transcriber'
import SummaryGenerator from '@/components/summary-generator'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'

export default function AppPage() {
  const router = useRouter()
  const auth = useAuth()
  const { toast } = useToast()

  const [isSigningOut, setIsSigningOut] = useState(false)
  const [meetings, setMeetings] = useState<any[]>([])
  const [isLoadingMeetings, setIsLoadingMeetings] = useState(true)
  
  const [transcriptionText, setTranscriptionText] = useState('')
  const [showSummaryGenerator, setShowSummaryGenerator] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const [department, setDepartment] = useState('');
  const [uniqueDepartments, setUniqueDepartments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // 获取会议列表
  const fetchMeetings = useCallback(async (query: string) => {
    if (!auth || !auth.user) return;
    setIsLoadingMeetings(true);
    setIsSearching(true);
    const { data, error } = await getMeetings(auth.user.id, query);
    if (error) {
      toast({
        variant: "destructive",
        title: "无法加载会议记录",
        description: error.message,
      });
    } else {
      setMeetings(data || []);
    }
    setIsLoadingMeetings(false);
    setIsSearching(false);
  }, [auth, toast]);

  useEffect(() => {
    if (auth && auth.user) {
      fetchMeetings('');
    }
  }, [auth]);

  useEffect(() => {
    if (meetings.length > 0) {
      const departments = meetings
        .map(m => m.department)
        .filter((d): d is string => d !== null && d.trim() !== '');
      setUniqueDepartments([...new Set(departments)]);
    }
  }, [meetings]);

  const handleSearch = () => {
      fetchMeetings(searchQuery);
  }

  const handleTranscript = (text: string) => {
    console.log("TRANSCRIPT RECEIVED:", text.substring(0, 100)); // Log first 100 chars
    setTranscriptionText(text)
  }

  // 摘要生成后的处理函数
  const handleSummaryGenerated = async (summary: string) => {
    if (!auth || !auth.user) {
        toast({ variant: "destructive", title: "错误", description: "用户未登录，无法保存会议。" });
        return;
    }

    // 将摘要作为标题，如果摘要太长则截断
    const meetingTitle = summary.length > 50 ? summary.substring(0, 47) + '...' : summary;

    const { error } = await addMeeting({
        user_id: auth.user.id,
        title: meetingTitle,
        summary: summary,
        content: transcriptionText,
        department: department,
    });

    if (error) {
        toast({ variant: "destructive", title: "保存失败", description: error.message });
    } else {
        toast({ title: "保存成功", description: "新的会议记录已创建。" });
        setShowSummaryGenerator(false);
        await fetchMeetings(''); // 重新加载会议列表以显示新记录
    }
  }

  // 处理退出登录
  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut()
    router.replace('/auth/login')
    setIsSigningOut(false)
  }

  // 查看会议详情
  const handleViewMeeting = (id: number) => {
    router.push(`/meetings/${id}`);
  }

  if (!auth || auth.isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">我的会议</h1>
          <Button variant="outline" onClick={handleSignOut} disabled={isSigningOut}>
            {isSigningOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 mr-1" />}
            退出
          </Button>
        </div>

        {/* 快速开始卡片 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>快速创建会议</CardTitle>
            <CardDescription>
              通过实时麦克风录音或"播放转写"本地音频文件来创建纪要。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-1 flex justify-center">
                    <SpeechRecognition onTranscript={handleTranscript} disabled={isTranscribing} />
                </div>

                <div className="md:col-span-1 flex items-center justify-center">
                    <div className="h-full w-px bg-muted md:h-20"></div>
                    <p className="mx-4 text-muted-foreground">或</p>
                    <div className="h-full w-px bg-muted md:h-20"></div>
                </div>

                <div className="md:col-span-3 flex flex-col justify-center">
                    <FreeAudioTranscriber onTranscript={handleTranscript} onIsTranscribingChange={setIsTranscribing} />
                </div>
            </div>

            <Textarea
              placeholder="转写文本将显示在这里..."
              value={transcriptionText}
              onChange={(e) => setTranscriptionText(e.target.value)}
              rows={8}
              className="mt-4"
            />

            <div className="mt-4">
                <Label htmlFor="department">部门 (可选)</Label>
                <Input 
                  id="department" 
                  placeholder="选择或输入新部门" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)}
                  list="department-list"
                />
                <datalist id="department-list">
                  {uniqueDepartments.map(d => <option key={d} value={d} />)}
                </datalist>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setTranscriptionText(''); setDepartment(''); setShowSummaryGenerator(false); }}>清空</Button>
              <Button onClick={() => setShowSummaryGenerator(true)} disabled={!transcriptionText || transcriptionText.length < 10 || isTranscribing}>
                生成摘要
              </Button>
          </CardFooter>
        </Card>
        
        {/* 摘要生成器 */}
        {showSummaryGenerator && (
           <div className="mb-6">
             <SummaryGenerator transcriptionText={transcriptionText} onSummaryGenerated={handleSummaryGenerated} />
           </div>
        )}

        {/* 会议列表与搜索 */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">历史会议</h2>
            <div className="flex gap-2">
                <Input placeholder="在标题、摘要、内容和部门中搜索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
            </div>
            {auth.isLoading || isLoadingMeetings ? (
                <div className="flex justify-center items-center py-12">
                   <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : meetings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {meetings.map(meeting => (
                    <Card key={meeting.id} className="cursor-pointer hover:bg-muted/50 transition-colors flex flex-col"
                        onClick={() => handleViewMeeting(meeting.id)}>
                    <CardHeader>
                        <CardTitle className="line-clamp-2">{meeting.title}</CardTitle>
                        <CardDescription>{new Date(meeting.created_at).toLocaleDateString()} {meeting.department && `· ${meeting.department}`}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <p className="line-clamp-4 text-sm text-muted-foreground">{meeting.summary}</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewMeeting(meeting.id); }}>
                            <FileText className="h-4 w-4 mr-2" />
                            查看详情
                        </Button>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>{searchQuery ? `没有找到与 "${searchQuery}" 相关的会议记录。` : "您还没有任何会议记录。"}</p>
                </div>
            )}
        </div>
      </div>
    </ProtectedRoute>
  )
} 