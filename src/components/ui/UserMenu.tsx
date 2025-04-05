import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const UserMenu: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar placeholder">
        {user?.avatar ? (
          <div className="w-10 rounded-full">
            <img src={user.avatar} alt={user.name} />
          </div>
        ) : (
          <div className="bg-neutral text-neutral-content rounded-full w-10">
            <span>{user?.name ? getInitials(user.name) : <User className="h-5 w-5" />}</span>
          </div>
        )}
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li className="menu-title">
          <span>{user?.name || 'User'}</span>
          <span className="text-xs opacity-60">{user?.email}</span>
        </li>
        <div className="divider my-1"></div>
        <li>
          <Link to="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </li>
        <li>
          <Link to="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </li>
        <li>
          <Link to="/help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Help & Support
          </Link>
        </li>
        <div className="divider my-1"></div>
        <li>
          <button onClick={handleLogout} className="flex items-center gap-2 text-error">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
};

export default UserMenu;
