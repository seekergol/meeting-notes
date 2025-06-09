import dynamic from 'next/dynamic';

const MeetingForm = dynamic(() => import('@/components/MeetingForm'), {
    ssr: false,
    loading: () => <p>Loading form...</p>
});

export default function NewMeetingPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">New Meeting Note</h1>
            <MeetingForm />
        </div>
    );
} 