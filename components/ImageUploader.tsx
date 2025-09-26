
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import Loader from './Loader';

interface ImageUploaderProps {
  images: { file: File, base64: string }[];
  onFilesSelect: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const MAX_FILES = 5;

export default function ImageUploader({
  images,
  onFilesSelect,
  onRemoveImage,
  description,
  onDescriptionChange,
  category,
  onCategoryChange,
  onSubmit,
  isLoading,
}: ImageUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((files: FileList | null) => {
    onFilesSelect(files);
  }, [onFilesSelect]);
  
  const handlePaste = useCallback((event: ClipboardEvent) => {
    if (images.length >= MAX_FILES) return;

    const items = event.clipboardData?.items;
    if (!items) return;
    
    const imageFile = Array.from(items).find(item => item.type.startsWith('image/'))?.getAsFile();

    if (imageFile) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(imageFile);
        onFilesSelect(dataTransfer.files);
        event.preventDefault();
    }
  }, [onFilesSelect, images.length]);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, over: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(over);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-800/50 p-6 md:p-8 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Crie a foto do seu produto</h2>
        <p className="text-slate-400 mt-2">Envie até {MAX_FILES} imagens do produto com um fundo simples para começar.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-col space-y-4">
          <div
            className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-colors duration-300 ${isDragOver ? 'border-violet-500 bg-violet-900/20' : 'border-slate-600'} ${images.length < MAX_FILES ? 'hover:border-slate-500 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
            onDragOver={(e) => images.length < MAX_FILES && handleDragEvents(e, true)}
            onDragLeave={(e) => handleDragEvents(e, false)}
            onDrop={(e) => images.length < MAX_FILES && handleDrop(e)}
            onClick={() => images.length < MAX_FILES && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files)}
              disabled={images.length >= MAX_FILES}
            />
            <div className="text-center py-6">
              <UploadIcon className="w-10 h-10 mx-auto text-slate-500 mb-2" />
              <p className="text-slate-300 font-semibold">Clique para enviar</p>
              <p className="text-xs text-slate-400">ou arraste e cole as imagens</p>
            </div>
          </div>
          
          {images.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Imagens Selecionadas ({images.length}/{MAX_FILES}):</h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img src={URL.createObjectURL(image.file)} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                    <button
                      onClick={() => onRemoveImage(index)}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0 w-5 h-5 flex items-center justify-center text-xs leading-none hover:bg-red-700 transition-colors"
                      aria-label="Remover imagem"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Descreva seu produto (ex: 'Bolsa de couro vermelha com fivelas douradas')"
            className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
            rows={4}
          />
          <input
            type="text"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder="Opcional: Categoria (ex: 'Cosméticos', 'Eletrônicos')"
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
          />
          {isLoading ? (
             <div className="flex items-center justify-center w-full bg-slate-700 h-[48px] rounded-lg">
                <Loader message="Gerando imagens..." />
             </div>
          ) : (
            <button
                onClick={onSubmit}
                disabled={images.length === 0 || !description.trim()}
                className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
            >
                Gerar 7 Imagens para E-commerce
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
