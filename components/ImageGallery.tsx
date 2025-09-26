
import React, { useState, useMemo } from 'react';
import { FinalImage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import Lightbox from './Lightbox';

interface ImageGalleryProps {
  results: FinalImage[];
  onStartOver: () => void;
}

const DownloadButton: React.FC<{ imageUrl: string; imageName: string }> = ({ imageUrl, imageName }) => {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique abra a galeria
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className="absolute bottom-2 right-2 bg-slate-900/50 text-white p-2 rounded-full hover:bg-violet-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
      aria-label="Baixar imagem"
    >
      <DownloadIcon className="w-5 h-5" />
    </button>
  );
};

export default function ImageGallery({ results, onStartOver }: ImageGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = useMemo(() => results.flatMap(result => result.images), [results]);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const goToPrev = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };
  
  const handleDownloadAll = () => {
    allImages.forEach((imgSrc, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = imgSrc;
        link.download = `ct-ecommerce-imagem-${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 200); // Adiciona um pequeno atraso para evitar problemas com o navegador
    });
  };

  let globalImageIndex = -1;

  return (
    <div className="w-full mx-auto animate-fade-in border-t-2 border-slate-700 pt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-100">Suas Imagens Estão Prontas!</h2>
        <p className="text-slate-400 mt-2">Clique em uma imagem para ampliar ou passe o mouse sobre ela para baixar.</p>
      </div>

      <div className="space-y-12">
        {results.map((result, resultIndex) => (
          <div key={resultIndex}>
            <h3 className="text-xl font-semibold text-slate-300 mb-4 border-b-2 border-slate-700 pb-2">{result.scene}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {result.images.map((imgSrc, imgIndex) => {
                globalImageIndex++;
                const currentIndex = globalImageIndex;
                return (
                  <div 
                    key={imgIndex} 
                    className="relative group aspect-square cursor-pointer"
                    onClick={() => openLightbox(currentIndex)}
                  >
                    <img
                      src={imgSrc}
                      alt={`Gerado para a cena: ${result.scene}`}
                      className="w-full h-full object-cover rounded-lg shadow-lg transition-transform group-hover:scale-105"
                    />
                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                    <DownloadButton imageUrl={imgSrc} imageName={`ct-ecommerce-cena-${result.scene.replace(/\s/g, '_')}-${imgIndex + 1}.jpg`} />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={onStartOver}
          className="bg-slate-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-700 transition-colors duration-300"
        >
          Limpar Imagens
        </button>
         <button
          onClick={handleDownloadAll}
          className="bg-violet-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-violet-700 transition-colors duration-300"
        >
          Baixar Todas
        </button>
      </div>

      {isLightboxOpen && allImages.length > 0 && (
        <Lightbox
          imageUrl={allImages[currentImageIndex]}
          onClose={closeLightbox}
          onNext={goToNext}
          onPrev={goToPrev}
        />
      )}
    </div>
  );
}
