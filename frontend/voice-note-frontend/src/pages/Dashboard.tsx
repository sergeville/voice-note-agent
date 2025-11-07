import { useEffect, useState } from 'react';
import { meetingAPI, systemAPI } from '../lib/api';
import { BarChart3, FileText, CheckCircle2, Clock, Cpu, Mic } from 'lucide-react';

interface Stats {
  totalMeetings: number;
  completedMeetings: number;
  processingMeetings: number;
  totalActionItems: number;
  totalDecisions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsResponse, configResponse] = await Promise.all([
        meetingAPI.getStats(),
        systemAPI.getConfig()
      ]);
      setStats(statsResponse.stats);
      setConfig(configResponse);
    } catch (error) {
      console.error('Failed to load data:', error);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of your meeting analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FileText className="w-8 h-8" />}
          title="Total Meetings"
          value={stats?.totalMeetings || 0}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="w-8 h-8" />}
          title="Completed"
          value={stats?.completedMeetings || 0}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-8 h-8" />}
          title="Processing"
          value={stats?.processingMeetings || 0}
          color="yellow"
        />
        <StatCard
          icon={<BarChart3 className="w-8 h-8" />}
          title="Action Items"
          value={stats?.totalActionItems || 0}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            title="Upload Audio"
            description="Upload a meeting recording for transcription"
            link="/upload"
            color="blue"
          />
          <QuickActionCard
            title="View Library"
            description="Browse all your processed meetings"
            link="/library"
            color="green"
          />
          <QuickActionCard
            title="Latest Meeting"
            description="View your most recent meeting minutes"
            link="/library"
            color="purple"
          />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Configuration</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Mic className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Transcription Engine</p>
              <p className="text-sm text-gray-600">{config?.transcription?.service || 'OpenAI Whisper'}</p>
              {config?.transcription?.fallbackMode && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Using {config.transcription.fallbackMode} (no API key configured)
                </p>
              )}
            </div>
            <StatusBadge status={config?.transcription?.hasApiKey ? 'configured' : 'fallback'} />
          </div>

          <div className="flex items-start space-x-3">
            <Cpu className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Analysis Model</p>
              <p className="text-sm text-gray-600">
                {config?.analysis?.service || 'Ollama'} - <span className="font-mono text-xs">{config?.analysis?.model || 'llama3.1:70b'}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Fallback: {config?.analysis?.fallbackMode || 'Rule-based Analysis'}
              </p>
            </div>
            <StatusBadge status="ready" />
          </div>

          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">Backend API</p>
              <p className="text-sm text-gray-600">Environment: {config?.environment || 'development'}</p>
            </div>
            <StatusBadge status="online" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
        {icon}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, link, color }: any) {
  const colorClasses = {
    blue: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50',
    green: 'border-green-200 hover:border-green-400 hover:bg-green-50',
    purple: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
  };

  return (
    <a
      href={link}
      className={`block p-4 border-2 rounded-lg transition-all ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </a>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    online: { color: 'green', label: 'Online' },
    ready: { color: 'green', label: 'Ready' },
    configured: { color: 'green', label: 'Configured' },
    fallback: { color: 'amber', label: 'Fallback' },
    offline: { color: 'red', label: 'Offline' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.offline;
  const colorClasses = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClasses[config.color as keyof typeof colorClasses]}`}>
      {config.label}
    </span>
  );
}
