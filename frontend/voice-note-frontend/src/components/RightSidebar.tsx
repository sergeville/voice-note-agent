import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ChevronDown, ChevronRight, Calendar, ExternalLink } from 'lucide-react';
import { meetingAPI } from '../lib/api';

interface Stats {
  totalMeetings: number;
  completedMeetings: number;
  processingMeetings: number;
  totalActionItems: number;
}

export default function RightSidebar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [showFeatures, setShowFeatures] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await meetingAPI.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Mock quota - in real app this would come from backend
  const usedMinutes = stats?.completedMeetings ? stats.completedMeetings * 10 : 0;
  const totalMinutes = 120;
  const percentUsed = (usedMinutes / totalMinutes) * 100;

  return (
    <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Plan Status */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">Free</span>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{usedMinutes} mins of {totalMinutes} mins used</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              The transcription quota will be reset at 03/04/2025 16:17
            </p>
          </div>
        </div>

        {/* Feature Usage Collapsible */}
        <div>
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700">Check feature usage</span>
            {showFeatures ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {showFeatures && (
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>📝</span>
                <span>Meetings: {stats?.totalMeetings || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>✅</span>
                <span>Completed: {stats?.completedMeetings || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>⏳</span>
                <span>Processing: {stats?.processingMeetings || 0}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📋</span>
                <span>Action Items: {stats?.totalActionItems || 0}</span>
              </div>
            </div>
          )}
        </div>

        {/* Upgrade CTA */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
          <Link
            to="/upgrade"
            className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition mb-3"
          >
            Upgrade
          </Link>
          <Link
            to="/trial"
            className="flex items-center justify-center text-blue-600 text-sm hover:text-blue-700"
          >
            Start my 3-day trial now
            <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {/* Pro Features List */}
        <div>
          <p className="text-sm font-medium text-gray-900 mb-3">
            Get Pro Plan to unlock more:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>AI Notes</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Recordings and transcripts export</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Transcript translation</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Max 1.5-hour duration per transcription</span>
            </li>
          </ul>
        </div>

        {/* Today's Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                Today's Events ({upcomingMeetings.length})
              </span>
            </div>
            <Link to="/calendar" className="text-xs text-blue-600 hover:text-blue-700">
              All events →
            </Link>
          </div>

          {upcomingMeetings.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4 flex justify-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-purple-600" />
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">No meetings scheduled for today.</p>
              <p className="text-xs text-gray-500">
                Open your calendar (Google Calendar or Outlook) and create events.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingMeetings.map((meeting, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{meeting.title}</p>
                  <p className="text-xs text-gray-600">{meeting.time}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
