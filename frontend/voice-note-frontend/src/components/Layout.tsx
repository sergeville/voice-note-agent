import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Upload,
  Library,
  FileText,
  Star,
  Settings,
  HelpCircle
} from 'lucide-react';
import RightSidebar from './RightSidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload' },
    { path: '/library', icon: Library, label: 'Library' },
    { path: '/starred', icon: Star, label: 'Starred' },
  ];

  const bottomNavItems = [
    { path: '/settings', icon: Settings, label: 'Settings' },
    { path: '/help', icon: HelpCircle, label: 'Help' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4">
        {/* Logo */}
        <Link to="/" className="mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col space-y-2 w-full px-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                w-12 h-12 flex items-center justify-center rounded-lg transition-all
                ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </nav>

        {/* Bottom Navigation Items */}
        <div className="flex flex-col space-y-2 w-full px-2 mt-auto">
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                w-12 h-12 flex items-center justify-center rounded-lg transition-all
                ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Center Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
