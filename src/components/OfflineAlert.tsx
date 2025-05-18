import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineAlert() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAlert, setShowAlert] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowAlert(true);
      // Auto hide the "back online" message after 3 seconds
      setTimeout(() => setShowAlert(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showAlert) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 py-2 px-4 rounded-md shadow-lg flex items-center gap-2 transition-all ${
      isOnline ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200' : 'bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200'
    }`}>
      {isOnline ? (
        <>
          <Wifi size={18} />
          <span>You're back online!</span>
        </>
      ) : (
        <>
          <WifiOff size={18} />
          <span>You're offline. Some features may be unavailable.</span>
        </>
      )}
      <button 
        onClick={() => setShowAlert(false)}
        className="ml-2 text-sm font-medium"
      >
        Dismiss
      </button>
    </div>
  );
}
