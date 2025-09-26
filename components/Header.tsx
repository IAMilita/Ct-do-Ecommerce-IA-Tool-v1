
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

export default function Header() {
  return (
    <header className="py-4 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 flex items-center justify-center">
        <SparklesIcon className="w-8 h-8 text-violet-400 mr-3" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-200 to-slate-400 text-transparent bg-clip-text">
          CT do Ecommerce - IA Tools
        </h1>
      </div>
    </header>
  );
}