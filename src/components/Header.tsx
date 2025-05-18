import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white shadow-md relative header-background">
      <div className="container mx-auto px-4 py-3 relative z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
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
            <NavLink 
              to="/home" 
              className={({ isActive }) => 
                `font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/video-upload" 
              className={({ isActive }) => 
                `font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
            >
              Video Upload
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
            <NavLink 
              to="/home" 
              className={({ isActive }) => 
                `block py-2 font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/video-upload" 
              className={({ isActive }) => 
                `block py-2 font-medium ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-green-500'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Video Upload
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
}
