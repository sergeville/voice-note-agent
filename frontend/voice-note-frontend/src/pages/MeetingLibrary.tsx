import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../lib/api';
import { ChevronDown } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  meetingDate: string;
  status: string;
  durationMinutes?: number;
  participants?: string;
  _count?: {
    actionItems: number;
    decisions: number;
  };
}

type TabType = 'recent' | 'starred' | 'created' | 'shared';

export default function MeetingLibrary() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('created');
  const [typeFilter] = useState('All Types'); // Will be used for future filtering

  useEffect(() => {
    loadMeetings();
  }, [activeTab]);

  const loadMeetings = async () => {
    try {
      const response = await meetingAPI.getAllMeetings();
      setMeetings(response.meetings);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter meetings based on active tab
  const getFilteredMeetings = () => {
    switch (activeTab) {
      case 'recent':
        return meetings.slice(0, 10); // Most recent 10
      case 'starred':
        return []; // TODO: Implement starred functionality
      case 'created':
        return meetings; // All meetings created by user
      case 'shared':
        return []; // TODO: Implement shared functionality
      default:
        return meetings;
    }
  };

  const filteredMeetings = getFilteredMeetings();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Records</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center space-x-8">
          <TabButton
            label="Recent"
            icon="🕐"
            active={activeTab === 'recent'}
            onClick={() => setActiveTab('recent')}
          />
          <TabButton
            label="Starred"
            icon="⭐"
            active={activeTab === 'starred'}
            onClick={() => setActiveTab('starred')}
          />
          <TabButton
            label="Created by me"
            icon="👤"
            active={activeTab === 'created'}
            onClick={() => setActiveTab('created')}
          />
          <TabButton
            label="Shared with me"
            icon="🔗"
            active={activeTab === 'shared'}
            onClick={() => setActiveTab('shared')}
          />
        </div>
      </div>

      {/* Filters and Type Dropdown */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <span className="text-sm font-medium text-gray-700">{typeFilter}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 text-sm font-medium text-gray-600">
          <div className="col-span-1"></div>
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Duration</div>
          <div className="col-span-3">Date created ↓</div>
          <div className="col-span-2">Creator</div>
        </div>

        {/* Table Body */}
        {filteredMeetings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-4">
              {activeTab === 'starred' && 'No starred meetings yet.'}
              {activeTab === 'shared' && 'No meetings shared with you.'}
              {activeTab === 'recent' && 'No recent meetings.'}
              {activeTab === 'created' && 'No meetings found. Upload your first recording!'}
            </p>
            {activeTab === 'created' && (
              <button
                onClick={() => navigate('/upload')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Upload Meeting
              </button>
            )}
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              onClick={() => navigate(`/meeting/${meeting.id}`)}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
            >
              <div className="col-span-1 flex items-center">
                {meeting.status === 'completed' ? '🎙️' : '⏳'}
              </div>
              <div className="col-span-4 flex items-center">
                <span className="font-medium text-gray-900 truncate">{meeting.title}</span>
              </div>
              <div className="col-span-2 flex items-center text-sm text-gray-600">
                {meeting.durationMinutes
                  ? `${Math.floor(meeting.durationMinutes)}min ${Math.floor((meeting.durationMinutes % 1) * 60)}s`
                  : 'N/A'}
              </div>
              <div className="col-span-3 flex items-center text-sm text-gray-600">
                {new Date(meeting.meetingDate).toLocaleString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="col-span-2 flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                    U
                  </div>
                  <span className="text-sm text-gray-700">User</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, icon, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 pb-3 border-b-2 transition ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}
