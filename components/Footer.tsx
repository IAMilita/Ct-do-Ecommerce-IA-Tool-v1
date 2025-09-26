import React from 'react';
import { InstagramIcon } from './icons/InstagramIcon';

export default function Footer() {
  return (
    <footer className="py-6 border-t border-slate-800">
      <div className="container mx-auto px-4 text-center text-slate-400 text-sm space-y-4">
         <div className="flex items-center justify-center gap-4">
          <span>Desenvolvido por Fabio Petrillo</span>
          <span className="text-slate-600">|</span>
          <a
            href="https://www.instagram.com/fl.petrillo"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors"
          >
            <InstagramIcon className="w-5 h-5" />
            <span>Instagram</span>
          </a>
        </div>
        <p>Quer aprender a vender pela internet do jeito certo? Contate pelo Instagram acima.</p>
      </div>
    </footer>
  );
}
