import { ReactNode, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, Users, Scissors, BarChart3, 
  LogOut, Menu, X, Home, UserCircle, Clock, Star
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  // Start with sidebar closed on mobile devices and open on larger screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const { user, logout, isManager } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/dashboard/login');
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Define navigation items based on user role
  const navItems = [
    { 
      name: 'Dashboard', 
      icon: <BarChart3 size={20} />, 
      path: '/dashboard', 
      visible: true 
    },
    { 
      name: 'Appointments', 
      icon: <Calendar size={20} />, 
      path: '/dashboard/appointments', 
      visible: true 
    },
    { 
      name: 'Barbers', 
      icon: <Scissors size={20} />, 
      path: '/dashboard/barbers', 
      visible: isManager 
    },
    { 
      name: 'Clients', 
      icon: <Users size={20} />, 
      path: '/dashboard/clients', 
      visible: isManager 
    },
    { 
      name: 'Walk-ins', 
      icon: <Clock size={20} />, 
      path: '/dashboard/walk-ins', 
      visible: isManager 
    },
    { 
      name: 'Reviews', 
      icon: <Star size={20} />, 
      path: '/dashboard/reviews', 
      visible: isManager 
    },
    { 
      name: 'My Profile', 
      icon: <UserCircle size={20} />, 
      path: '/dashboard/profile', 
      visible: !isManager 
    }
  ];

  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-white">
      {/* Mobile sidebar toggle - moved to the header for better visibility */}
      <div className="md:hidden fixed top-0 left-0 z-30 p-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-black text-white hover:bg-gray-900 focus:outline-none shadow-md"
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      {/* Sidebar backdrop for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-20 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:inset-0 md:w-64 bg-black shadow-lg overflow-y-auto`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="px-4 py-6 md:px-6 md:py-8 flex items-center justify-center">
            <div className="relative">
              <div className="font-['Bebas_Neue'] text-3xl md:text-4xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 relative z-10 transform -rotate-2 pr-1">
                AMAI
              </div>
              <div className="font-['Lato'] text-xs font-light uppercase tracking-[0.25em] text-white transform translate-y-0 pl-1 border-l-2 border-amber-400">
                {isManager ? 'MANAGER' : 'BARBER'}
              </div>
            </div>
          </div>
          
          {/* User info */}
          <div className="px-4 py-3 md:px-6 md:py-4 border-t border-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center text-white font-medium">
                {user?.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white truncate" style={{ maxWidth: 'calc(100% - 20px)' }}>{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.role === 'manager' ? 'Manager' : 'Barber'}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 md:px-4 md:py-4 space-y-1 overflow-y-auto">
            {navItems
              .filter(item => item.visible)
              .map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center px-3 py-3 text-gray-300 hover:bg-gray-900 hover:text-white rounded-lg group transition-colors duration-200 text-base md:text-sm"
                >
                  <span className="mr-3 text-gray-400 group-hover:text-amber-400">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
          </nav>
          
          {/* Public website link */}
          <div className="px-4 py-2 border-t border-gray-800">
            <Link
              to="/"
              className="flex items-center px-2 py-3 text-gray-300 hover:bg-gray-900 hover:text-white rounded-lg group transition-colors duration-200"
            >
              <span className="mr-3 text-gray-400 group-hover:text-amber-400">
                <Home size={20} />
              </span>
              <span>View Website</span>
            </Link>
          </div>
          
          {/* Logout */}
          <div className="px-4 py-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-gray-300 hover:bg-gray-900 hover:text-white rounded-lg group transition-colors duration-200 text-base md:text-sm"
            >
              <span className="mr-3 text-gray-400 group-hover:text-red-400">
                <LogOut size={20} />
              </span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center">
              {/* Left space for mobile sidebar toggle */}
              <div className="w-8 md:hidden"></div>
              <h1 className="text-base md:text-xl font-semibold text-gray-900 ml-6 md:ml-0 truncate">
                Amai Men's Care
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>
        
        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
