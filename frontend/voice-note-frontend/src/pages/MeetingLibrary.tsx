import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { meetingAPI } from '../lib/api';
import { Calendar, Clock, Users, ChevronRight } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  meetingDate: string;
  status: string;
  participants?: string;
  _count?: {
    actionItems: number;
    decisions: number;
  };
}

export default function MeetingLibrary() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadMeetings();
  }, [filter]);

  const loadMeetings = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await meetingAPI.getAllMeetings(params);
      setMeetings(response.meetings);
    } catch (error) {
      console.error('Failed to load meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meeting Library</h1>
          <p className="mt-2 text-gray-600">Browse and manage your meeting minutes</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex space-x-2">
          <FilterButton label="All" value="all" active={filter === 'all'} onClick={setFilter} />
          <FilterButton label="Completed" value="completed" active={filter === 'completed'} onClick={setFilter} />
          <FilterButton label="Processing" value="processing" active={filter === 'processing'} onClick={setFilter} />
          <FilterButton label="Transcribed" value="transcribed" active={filter === 'transcribed'} onClick={setFilter} />
        </div>
      </div>

      {/* Meeting List */}
      <div className="space-y-4">
        {meetings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No meetings found. Upload your first meeting recording to get started!</p>
            <Link to="/upload" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
              Upload Meeting
            </Link>
          </div>
        ) : (
          meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))
        )}
      </div>
    </div>
  );
}

function FilterButton({ label, value, active, onClick }: any) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-md font-medium transition ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}

function MeetingCard({ meeting }: { meeting: Meeting }) {
  const statusColors: { [key: string]: string } = {
    completed: 'bg-green-100 text-green-800',
    processing: 'bg-yellow-100 text-yellow-800',
    transcribed: 'bg-blue-100 text-blue-800',
    uploaded: 'bg-gray-100 text-gray-800',
    error: 'bg-red-100 text-red-800'
  };

  const statusColor = statusColors[meeting.status] || statusColors.uploaded;

  return (
    <Link to={`/meeting/${meeting.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {meeting.status}
              </span>
            </div>
            
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(meeting.meetingDate).toLocaleDateString()}</span>
              </div>
              {meeting.participants && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{meeting.participants.split(',').length} participants</span>
                </div>
              )}
              {meeting._count && (
                <>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{meeting._count.actionItems}</span>
                    <span>action items</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">{meeting._count.decisions}</span>
                    <span>decisions</span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}
