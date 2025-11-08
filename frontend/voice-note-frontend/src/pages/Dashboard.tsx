import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../lib/api';
import { Mic, Upload, Video, MonitorPlay, FileText } from 'lucide-react';

interface Stats {
  totalMeetings: number;
  completedMeetings: number;
  processingMeetings: number;
  totalActionItems: number;
  totalDecisions: number;
}

interface Meeting {
  id: string;
  title: string;
  meetingDate: string;
  status: string;
  durationMinutes?: number;
  participants?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, meetingsResponse] = await Promise.all([
        meetingAPI.getStats(),
        meetingAPI.getAllMeetings()
      ]);
      setStats(statsResponse.stats);
      setRecentMeetings(meetingsResponse.meetings.slice(0, 2));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get username or default
  const userName = 'User';

  // Random inspiring quotes
  const quotes = [
    { text: 'Thinking: the talking of the soul with itself.', author: 'Plato' },
    { text: 'The only true wisdom is in knowing you know nothing.', author: 'Socrates' },
    { text: 'Quality is not an act, it is a habit.', author: 'Aristotle' },
    { text: 'We are what we repeatedly do.', author: 'Aristotle' }
  ];
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div className="flex items-start space-x-3">
        <span className="text-4xl">👋</span>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getGreeting()}, {userName}
          </h1>
          <p className="mt-2 text-gray-600 italic flex items-center space-x-2">
            <span>💭</span>
            <span className="text-sm">
              <span className="font-medium">{randomQuote.author}</span>: {randomQuote.text}
            </span>
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActionCard
          icon={<Mic className="w-6 h-6" />}
          title="Instant record"
          onClick={() => navigate('/upload')}
          color="blue"
        />
        <ActionCard
          icon={<Upload className="w-6 h-6" />}
          title="Upload & transcribe"
          onClick={() => navigate('/upload')}
          color="green"
        />
        <ActionCard
          icon={<Video className="w-6 h-6" />}
          title="Record online meeting"
          onClick={() => navigate('/upload')}
          color="purple"
          badge="Coming Soon"
        />
        <ActionCard
          icon={<MonitorPlay className="w-6 h-6" />}
          title="Record screen"
          onClick={() => navigate('/upload')}
          color="orange"
          badge="Beta"
        />
      </div>

      {/* My Records Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Records</h2>

        <div className="bg-white rounded-lg shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 text-sm font-medium text-gray-600">
            <div className="col-span-1"></div>
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Duration</div>
            <div className="col-span-3">Date created</div>
            <div className="col-span-1">Creator</div>
          </div>

          {/* Table Body */}
          {recentMeetings.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No meetings found. Upload your first recording!</p>
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Upload Meeting
              </button>
            </div>
          ) : (
            <div>
              {recentMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => navigate(`/meeting/${meeting.id}`)}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="col-span-1 flex items-center">
                    {meeting.status === 'completed' ? '🎙️' : '⏳'}
                  </div>
                  <div className="col-span-5 flex items-center">
                    <span className="font-medium text-gray-900">{meeting.title}</span>
                  </div>
                  <div className="col-span-2 flex items-center text-sm text-gray-600">
                    {meeting.durationMinutes
                      ? `${Math.floor(meeting.durationMinutes)}min ${Math.floor((meeting.durationMinutes % 1) * 60)}s`
                      : 'N/A'}
                  </div>
                  <div className="col-span-3 flex items-center text-sm text-gray-600">
                    {new Date(meeting.meetingDate).toLocaleString()}
                  </div>
                  <div className="col-span-1 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}

              <div className="px-6 py-4 text-center">
                <button
                  onClick={() => navigate('/library')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all meetings →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  color: string;
  badge?: string;
}

function ActionCard({ icon, title, onClick, color, badge }: ActionCardProps) {
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100'
  };

  return (
    <button
      onClick={onClick}
      className={`relative p-6 rounded-lg border border-gray-200 transition-all hover:shadow-md ${
        colorClasses[color] || colorClasses.blue
      }`}
    >
      {badge && (
        <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium bg-white rounded-full text-gray-600 border border-gray-200">
          {badge}
        </span>
      )}
      <div className="flex flex-col items-center space-y-2">
        {icon}
        <span className="font-medium text-sm">{title}</span>
      </div>
    </button>
  );
}
