import React, { useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useAppStore();
  
  // Apply theme on mount and when theme changes
  useEffect(() => {
    const applyTheme = () => {
      const root = window.document.documentElement;
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.setAttribute('data-theme', systemTheme);
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.setAttribute('data-theme', theme);
        root.classList.toggle('dark', theme === 'dark');
      }
    };
    
    applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);
  
  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        {theme === 'dark' ? (
          <Moon className="h-5 w-5" />
        ) : theme === 'light' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Monitor className="h-5 w-5" />
        )}
      </div>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <button 
            className={`flex items-center gap-2 ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            <Sun className="h-4 w-4" />
            Light
          </button>
        </li>
        <li>
          <button 
            className={`flex items-center gap-2 ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <Moon className="h-4 w-4" />
            Dark
          </button>
        </li>
        <li>
          <button 
            className={`flex items-center gap-2 ${theme === 'system' ? 'active' : ''}`}
            onClick={() => setTheme('system')}
          >
            <Monitor className="h-4 w-4" />
            System
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ThemeToggle;
