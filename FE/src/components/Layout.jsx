import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Video, Calendar, User, GraduationCap, LogOut, BookOpen, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userRole, handleLogout } = useApp();

  // Role-based navigation items
  const getNavItems = () => {
    const baseItems = [
      { path: '/daily', label: 'Daily Overview', icon: LayoutDashboard },
      { path: '/videos', label: 'Daily Videos', icon: Video },
      { path: '/weekly', label: 'Weekly Tasks', icon: Calendar },
    ];
    
    // Add role-specific items
    if (userRole === 'student') {
      baseItems.push({ path: '/student', label: 'Student', icon: User });
    } else if (userRole === 'tutor') {
      baseItems.push({ path: '/teacher', label: 'Teacher', icon: GraduationCap });
    }
    
    return baseItems;
  };

  const navItems = getNavItems();

  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LearnFlow</h1>
                <p className="text-xs text-gray-500">Daily Learning Tracker</p>
              </div>
            </div>
            
            {/* User Info and Actions */}
            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                      <p className="text-xs text-gray-600">Keep up the great work</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-semibold text-sm">{getUserInitial()}</span>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await handleLogout();
                      navigate('/login');
                    }}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path === '/daily' && location.pathname === '/') ||
                (item.path === '/weekly' && location.pathname.startsWith('/weekly'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-500 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
