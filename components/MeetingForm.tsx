'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';
import { CornerDownLeft } from 'lucide-react';

export default function MeetingForm() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const recognition = useRef<SpeechRecognition | null>(null);
    const router = useRouter();
    const { user } = useAuth();
    const supabase = createClient();

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const r = new SpeechRecognition();
            r.continuous = true;
            r.interimResults = true;
            r.lang = 'zh-CN';

            r.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                // Update content with the latest transcript
                // We append the final transcript to the existing content
                setContent(prevContent => prevContent + finalTranscript + interimTranscript);
            };

            r.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setIsRecording(false);
            };

            r.onend = () => {
                if (isRecording) {
                    // If recording should still be active, restart it.
                    // This handles cases where the recognition service automatically stops.
                    r.start();
                } else {
                    setIsRecording(false);
                }
            };
            
            recognition.current = r;
        } else {
            console.warn('Speech Recognition not supported');
        }

        return () => {
            if (recognition.current) {
                recognition.current.stop();
            }
        };
        // isRecording is added to the dependency array to handle the restart logic in onend
    }, [isRecording]);

    const toggleRecording = () => {
        if (!recognition.current) return;

        if (isRecording) {
            recognition.current.stop();
            setIsRecording(false);
        } else {
            setContent(''); // Clear previous content when starting new recording
            recognition.current.start();
            setIsRecording(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('You must be logged in to create a meeting note.');
            return;
        }

        const { data, error } = await supabase
            .from('meetings')
            .insert([{ user_id: user.id, title, content }])
            .select();

        if (error) {
            console.error('Error creating meeting:', error);
            alert('Failed to save the meeting note.');
        } else {
            console.log('Meeting created:', data);
            router.push('/app/meetings');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                </label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                </label>
                <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={10}
                    placeholder="Meeting notes will appear here..."
                />
            </div>
            <div className="flex items-center justify-between">
                <Button type="button" onClick={toggleRecording} variant={isRecording ? 'destructive' : 'secondary'}>
                    {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                    Save Note <CornerDownLeft size={16} />
                </Button>
            </div>
        </form>
    );
} 