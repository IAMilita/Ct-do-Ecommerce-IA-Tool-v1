
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { VideoIcon } from './icons/VideoIcon';
import { UploadIcon } from './icons/UploadIcon';
import { generateVideoScenes, generateSingleProductVideo, getPollingVideosOperation } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';
import { VideoScene } from '../types';
import Loader from './Loader';

const MAX_FILES = 7;

interface VideoGeneratorProps {
    productDescription: string;
}

export default function VideoGenerator({ productDescription }: VideoGeneratorProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<{ file: File; base64: string }[]>([]);
    const [scenes, setScenes] = useState<VideoScene[]>([]);
    const [error, setError] = useState<string | null>(null);
    
    const [isLoadingScenes, setIsLoadingScenes] = useState(false);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);
    const [videoUrls, setVideoUrls] = useState<(string | null)[]>([]);
    const [loadingMessage, setLoadingMessage] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (productDescription) {
            setDescription(productDescription);
        }
    }, [productDescription]);

    const handleFilesSelect = useCallback(async (files: FileList | null) => {
        if (files) {
            const newImagesPromises = Array.from(files).map(async (file) => ({
                file,
                base64: await fileToBase64(file),
            }));
            const newImages = await Promise.all(newImagesPromises);
            setImages((prev) => [...prev, ...newImages].slice(0, MAX_FILES));
        }
    }, []);

    const handleRemoveImage = useCallback((indexToRemove: number) => {
        setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    }, []);
    
    const handleSceneGeneration = async () => {
        setError(null);
        setIsLoadingScenes(true);
        setScenes([]);
        try {
            const imagesForApi = images.map(img => ({ base64: img.base64, mimeType: img.file.type }));
            const generatedScenes = await generateVideoScenes(title, description, imagesForApi);
            setScenes(generatedScenes);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao gerar o roteiro.');
        } finally {
            setIsLoadingScenes(false);
        }
    };
    
    const handleVideoGeneration = async () => {
        setError(null);
        setIsLoadingVideo(true);
        setVideoUrls(Array(scenes.length).fill(null));
    
        try {
            const imagesForApi = images.map(img => ({ base64: img.base64, mimeType: img.file.type }));
    
            for (let i = 0; i < scenes.length; i++) {
                const scene = scenes[i];
                setLoadingMessage(`Gerando vídeo ${i + 1} de ${scenes.length}... (Isso pode levar alguns minutos)`);
                
                try {
                    // Step 1: Start the video generation for a single scene
                    const operation = await generateSingleProductVideo(scene, imagesForApi);
    
                    // Step 2: Poll the operation until it's complete
                    let currentOperation = operation;
                    while (!currentOperation.done) {
                        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
                        currentOperation = await getPollingVideosOperation(currentOperation);
                    }
    
                    // Step 3: Get the URL and update the state
                    const downloadLink = currentOperation.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                        const blob = await response.blob();
                        const videoUrl = URL.createObjectURL(blob);
    
                        setVideoUrls(prevUrls => {
                            const newUrls = [...prevUrls];
                            newUrls[i] = videoUrl;
                            return newUrls;
                        });
                    } else {
                        throw new Error(`Link de download não encontrado para a cena ${i + 1}.`);
                    }
                } catch (videoError) {
                    console.error(`Erro ao gerar vídeo para a cena ${i + 1}:`, videoError);
                    // Mark this video as failed by leaving it null, and continue to the next
                }
            }
            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha geral ao gerar os vídeos.');
        } finally {
            setIsLoadingVideo(false);
            setLoadingMessage('');
        }
    };


    const handleScenePromptChange = (index: number, newPrompt: string) => {
        const updatedScenes = [...scenes];
        updatedScenes[index].prompt = newPrompt;
        setScenes(updatedScenes);
    };

    const canGenerateScenes = title.trim() && description.trim() && images.length > 0;
    
    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-800/50 p-6 md:p-8 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700 flex flex-col space-y-6">
            <div className="text-center">
                 <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-3">
                    <VideoIcon className="w-7 h-7 text-violet-400" />
                    Crie o Vídeo do Seu Produto
                </h2>
                <p className="text-slate-400 mt-2">Gere 6 clipes de vídeo para Reels e Shorts.</p>
            </div>
            
            {isLoadingVideo ? (
                <div className="flex flex-col items-center justify-center h-96">
                    <Loader message={loadingMessage || 'Processando vídeos...'} />
                </div>
            ) : videoUrls.some(url => url) ? (
                 <div className="space-y-4 text-center animate-fade-in">
                    <h3 className="text-xl font-semibold text-green-400">Seus clipes de vídeo estão prontos!</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {scenes.map((scene, index) => (
                            <div key={index} className="space-y-2">
                                <h4 className="font-semibold text-slate-300 text-sm truncate">{scene.title}</h4>
                                {videoUrls[index] ? (
                                    <>
                                        <video controls src={videoUrls[index]!} className="w-full rounded-lg aspect-[9/16] object-cover" />
                                        <a href={videoUrls[index]!} download={`video-cena-${index + 1}.mp4`} className="text-xs inline-block bg-violet-600 text-white font-bold py-1.5 px-3 rounded-md hover:bg-violet-700 transition-colors">
                                            Baixar
                                        </a>
                                    </>
                                ) : (
                                    <div className="aspect-[9/16] bg-slate-700 rounded-lg flex items-center justify-center text-center p-2">
                                        <p className="text-red-400 text-xs">Falha na geração</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                     <button onClick={() => setVideoUrls([])} className="mt-4 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                        Gerar Novo Vídeo
                    </button>
                </div>
            ) : (
                <>
                    {/* Step 1: Inputs */}
                    {!scenes.length && !isLoadingScenes && (
                        <div className="space-y-4 animate-fade-in">
                             <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Insira o Título do Produto" className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                             <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Insira a Descrição do Produto" className="w-full h-24 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none" rows={3} />
                             
                             <div>
                                <div
                                    className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl transition-colors ${images.length < MAX_FILES ? 'hover:border-slate-500 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                                    onClick={() => images.length < MAX_FILES && fileInputRef.current?.click()}
                                >
                                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFilesSelect(e.target.files)} disabled={images.length >= MAX_FILES} />
                                    <div className="text-center py-2">
                                        <UploadIcon className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                                        <p className="text-slate-300 text-sm font-semibold">Enviar até {MAX_FILES} imagens</p>
                                    </div>
                                </div>
                                {images.length > 0 && (
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                                        {images.map((img, i) => (
                                            <div key={i} className="relative group aspect-square">
                                                <img src={URL.createObjectURL(img.file)} alt={`Preview ${i+1}`} className="w-full h-full object-cover rounded-md" />
                                                <button onClick={() => handleRemoveImage(i)} className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" aria-label="Remover">&times;</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                             </div>

                             <button onClick={handleSceneGeneration} disabled={!canGenerateScenes || isLoadingScenes} className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 disabled:bg-slate-600 transition-colors">
                                {isLoadingScenes ? 'Gerando Roteiro...' : '1. Gerar Cenas'}
                             </button>
                        </div>
                    )}
                    
                    {isLoadingScenes && <Loader message="A IA está criando um roteiro de marketing..." />}

                    {/* Step 2: Scene Approval */}
                    {scenes.length > 0 && (
                        <div className="space-y-4 animate-fade-in">
                            <p className="text-center text-slate-300">Revise e edite as cenas do seu vídeo se necessário.</p>
                            {scenes.map((scene, index) => (
                                <div key={index}>
                                    <label className="block text-sm font-semibold text-slate-300 mb-1">{scene.title}</label>
                                    <textarea value={scene.prompt} onChange={(e) => handleScenePromptChange(index, e.target.value)} className="w-full h-24 p-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-300 focus:ring-1 focus:ring-violet-500" />
                                </div>
                            ))}
                            <button onClick={handleVideoGeneration} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                2. Gerar {scenes.length} Vídeos
                            </button>
                        </div>
                    )}
                </>
            )}

            {error && !isLoadingVideo && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}
        </div>
    );
}
