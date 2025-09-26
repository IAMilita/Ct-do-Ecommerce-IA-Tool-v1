
import React, { useState } from 'react';
import { generateProductDescription } from '../services/geminiService';
import { CopyIcon } from './icons/CopyIcon';

interface DescriptionGeneratorProps {
  onDescriptionGenerated: (description: string) => void;
}

export default function DescriptionGenerator({ onDescriptionGenerated }: DescriptionGeneratorProps) {
    const [productTitle, setProductTitle] = useState('');
    const [modelDescription, setModelDescription] = useState('');
    const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const canGenerate = productTitle.trim() && modelDescription.trim();

    const handleGenerate = async () => {
        if (!canGenerate) return;
        
        setIsLoading(true);
        setError(null);
        setCopied(false);

        try {
            const description = await generateProductDescription(productTitle, modelDescription);
            setGeneratedDescription(description);
            onDescriptionGenerated(description);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!generatedDescription) return;
        navigator.clipboard.writeText(generatedDescription);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-800/50 p-6 md:p-8 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700 flex flex-col">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Crie a Descrição do Seu Produto</h2>
                <p className="text-slate-400 mt-2">Gere descrições persuasivas e otimizadas para SEO.</p>
            </div>

            <div className="flex flex-col space-y-4">
                <input 
                    type="text" 
                    value={productTitle} 
                    onChange={(e) => setProductTitle(e.target.value)} 
                    placeholder="Título do Produto" 
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all" 
                />
                <textarea
                    value={modelDescription}
                    onChange={(e) => setModelDescription(e.target.value)}
                    placeholder="Descrição de Modelo (descreva o produto, material, etc.)"
                    className="w-full h-32 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
                    rows={4}
                />
                <button
                    onClick={handleGenerate}
                    disabled={!canGenerate || isLoading}
                    className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                >
                    {isLoading ? 'Gerando...' : 'Gerar Descrição'}
                </button>
            </div>
            
            {isLoading && (
                <div className="text-center mt-6">
                    <p className="text-slate-400">A IA está escrevendo uma descrição incrível...</p>
                </div>
            )}

            {error && (
                 <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-center">
                    <p className="text-red-400">{error}</p>
                </div>
            )}
            
            {generatedDescription && (
                <div className="mt-8 border-t border-slate-700 pt-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold text-slate-200">Descrição Gerada:</h3>
                         <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 text-sm p-2 rounded-md hover:bg-slate-700 transition-colors text-slate-300"
                            aria-label="Copiar descrição"
                        >
                            {copied ? (
                                 <span className="text-xs text-violet-400">Copiado!</span>
                            ) : (
                                <>
                                 <CopyIcon className="w-4 h-4" />
                                 <span>Copiar</span>
                                </>
                            )}
                        </button>
                    </div>
                    <div className="w-full p-4 h-64 overflow-y-auto bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 text-sm whitespace-pre-wrap">
                        {generatedDescription}
                    </div>
                    <div className="mt-4 text-center">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="text-sm font-semibold text-violet-400 hover:text-violet-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                        >
                           Gerar Outra Descrição
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
