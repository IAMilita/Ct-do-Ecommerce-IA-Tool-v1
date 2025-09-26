import React, { useEffect } from 'react';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { XIcon } from './icons/XIcon';

interface LightboxProps {
  imageUrl: string;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({ imageUrl, onClose, onNext, onPrev }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div className="relative w-full h-full max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Imagem ampliada" className="w-full h-full object-contain" />
      </div>

      <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors" aria-label="Fechar">
        <XIcon className="w-8 h-8" />
      </button>
      
      <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-300 transition-colors p-2 bg-black/30 rounded-full" aria-label="Anterior">
        <ChevronLeftIcon className="w-8 h-8" />
      </button>

      <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-slate-300 transition-colors p-2 bg-black/30 rounded-full" aria-label="Próximo">
        <ChevronRightIcon className="w-8 h-8" />
      </button>
    </div>
  );
}