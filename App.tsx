
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { AppStep, FinalImage } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import ImageUploader from './components/ImageUploader';
import ImageGallery from './components/ImageGallery';
import Loader from './components/Loader';
import TitleGenerator from './components/TitleGenerator';
import DescriptionGenerator from './components/DescriptionGenerator';
import VideoGenerator from './components/VideoGenerator';
import { generateEcommerceImageSet } from './services/geminiService';
import { fileToBase64, processImage } from './utils/imageUtils';

export default function App() {
  const [productImages, setProductImages] = useState<{ file: File; base64: string }[]>([]);
  const [productDescription, setProductDescription] = useState<string>('');
  const [productCategory, setProductCategory] = useState<string>('');
  const [finalImages, setFinalImages] = useState<FinalImage[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (generatedDescription) {
      setProductDescription(generatedDescription);
    }
  }, [generatedDescription]);
  
  useEffect(() => {
    if (finalImages.length > 0) {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [finalImages]);


  const handleReset = () => {
    setProductImages([]);
    setProductDescription('');
    setProductCategory('');
    setFinalImages([]);
    setIsLoadingImages(false);
    setError(null);
    setGeneratedDescription(null);
     window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageGeneration = useCallback(async () => {
    if (productImages.length === 0) {
      setError('Por favor, envie pelo menos uma imagem do produto.');
      return;
    }
    
    setError(null);
    setIsLoadingImages(true);
    setFinalImages([]);

    try {
      const imagesForApi = productImages.map(img => ({ base64: img.base64, mimeType: img.file.type }));
      
      const generatedBase64Images = await generateEcommerceImageSet(
        imagesForApi,
        productDescription,
        productCategory
      );
      
      const processedImages = await Promise.all(generatedBase64Images.map(base64 => processImage(base64)));
      
      const finalResults: FinalImage[] = [
        { scene: "Fundo Branco (Estúdio)", images: processedImages.length > 0 ? [processedImages[0]] : [] },
        { scene: "Ângulo do Produto", images: processedImages.length > 1 ? [processedImages[1]] : [] },
        { scene: "Informações Técnicas", images: processedImages.length > 2 ? [processedImages[2]] : [] },
        { scene: "Tabela de Medidas", images: processedImages.length > 3 ? [processedImages[3]] : [] },
        { scene: "Cenas de Uso", images: processedImages.length > 4 ? processedImages.slice(4) : [] },
      ].filter(result => result.images.length > 0);

      setFinalImages(finalResults);
    } catch (err) {
      console.error('Erro ao gerar imagens finais:', err);
      setError('Não foi possível gerar as imagens. Por favor, tente novamente.');
    } finally {
      setIsLoadingImages(false);
    }
  }, [productImages, productDescription, productCategory]);
  
  const handleFilesSelect = useCallback(async (files: FileList | null) => {
    if (files) {
      const newImagesPromises = Array.from(files).map(async (file) => ({
        file,
        base64: await fileToBase64(file),
      }));
      const newImages = await Promise.all(newImagesPromises);
      
      setProductImages((prevImages) => [...prevImages, ...newImages].slice(0, 5));
    }
  }, []);
  
  const handleRemoveImage = useCallback((indexToRemove: number) => {
    setProductImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  }, []);

  const handleClearGeneratedImages = () => {
    setFinalImages([]);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16 flex items-center justify-center">
        <div className="w-full max-w-screen-3xl">
          {error && (
            <div className="text-center p-8 mb-8 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-xl mb-4">Ocorreu um Erro</p>
              <p className="text-slate-300 mb-6">{error}</p>
              <button
                onClick={() => setError(null)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <TitleGenerator />
              <DescriptionGenerator onDescriptionGenerated={setGeneratedDescription} />
              <ImageUploader
                images={productImages}
                onFilesSelect={handleFilesSelect}
                onRemoveImage={handleRemoveImage}
                description={productDescription}
                onDescriptionChange={setProductDescription}
                category={productCategory}
                onCategoryChange={setProductCategory}
                onSubmit={handleImageGeneration}
                isLoading={isLoadingImages}
              />
              <VideoGenerator productDescription={generatedDescription || ''} />
            </div>

            <div ref={resultsRef}>
              {finalImages.length > 0 && (
                <ImageGallery 
                  results={finalImages} 
                  onStartOver={handleClearGeneratedImages} 
                  productTitle={productDescription}
                />
              )}
            </div>
          </div>
          <div className="mt-16 text-center">
            <button
                onClick={() => window.location.reload()}
                className="bg-slate-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-slate-700 transition-colors duration-300"
            >
                Recarregar Página
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}