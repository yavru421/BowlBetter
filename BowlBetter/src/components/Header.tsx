import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-2">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" stroke="#ffffff" strokeWidth="2" />
                <path d="M12 5C13.6569 5 15 6.34315 15 8C15 9.65685 13.6569 11 12 11C10.3431 11 9 9.65685 9 8C9 6.34315 10.3431 5 12 5Z" fill="#ffffff" />
              </svg>
            </div>
            <span className="text-xl font-bold text-green-700">BowlBetter!</span>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink 
              to="/analyzer" 
              className={({ isActive }) => 
                `font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
            >
              Approach Analyzer
            </NavLink>
            <NavLink 
              to="/release" 
              className={({ isActive }) => 
                `font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
            >
              Release Analysis
            </NavLink>
            <NavLink 
              to="/tournament" 
              className={({ isActive }) => 
                `font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
            >
              Tournament Tools
            </NavLink>
            <NavLink 
              to="/hardware" 
              className={({ isActive }) => 
                `font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
            >
              Hardware Inventory
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
            >
              Settings
            </NavLink>
          </nav>
          
          {/* Theme toggle and mobile menu buttons */}
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-md text-gray-600 hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-green-500 dark:text-gray-300 dark:hover:text-green-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-3 pb-3">
            <NavLink 
              to="/analyzer" 
              className={({ isActive }) => 
                `block py-2 font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Approach Analyzer
            </NavLink>
            <NavLink 
              to="/release" 
              className={({ isActive }) => 
                `block py-2 font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Release Analysis
            </NavLink>
            <NavLink 
              to="/tournament" 
              className={({ isActive }) => 
                `block py-2 font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Tournament Tools
            </NavLink>
            <NavLink 
              to="/hardware" 
              className={({ isActive }) => 
                `block py-2 font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Hardware Inventory
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => 
                `block py-2 font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
