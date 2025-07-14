import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/', icon: '📊' },
    { id: 'projects', label: 'Projects', path: '/projects', icon: '🏗️' },
    { id: 'leads', label: 'Leads', path: '/leads', icon: '👥' },
    { id: 'estimates', label: 'Estimates', path: '/estimates', icon: '📋' },
    { id: 'materials', label: 'Materials', path: '/materials', icon: '🧱' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;