
import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';

interface LoaderProps {
  message?: string;
}

export default function Loader({ message }: LoaderProps) {
  const [dynamicMessage, setDynamicMessage] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDynamicMessage(prev => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 border-4 border-t-violet-400 border-r-violet-400 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      <p className="mt-6 text-lg text-slate-300 font-medium text-center">
        {message || dynamicMessage}
      </p>
    </div>
  );
}
