
import React, { useState } from 'react';
import { generateProductTitles } from '../services/geminiService';
import { GeneratedTitles } from '../types';
import { CopyIcon } from './icons/CopyIcon';

const TitleResultItem: React.FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <li className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg group">
            <span className="text-slate-300 text-sm flex-1 pr-2">{text}</span>
            <button
                onClick={handleCopy}
                className="p-1.5 rounded-md hover:bg-slate-600 transition-colors text-slate-400"
                aria-label="Copiar título"
            >
                {copied ? (
                     <span className="text-xs text-violet-400">Copiado!</span>
                ) : (
                    <CopyIcon className="w-4 h-4" />
                )}
            </button>
        </li>
    );
};


export default function TitleGenerator() {
    const [currentTitle, setCurrentTitle] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [characteristics, setCharacteristics] = useState('');
    const [generatedTitles, setGeneratedTitles] = useState<GeneratedTitles | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canGenerate = currentTitle.trim() && brand.trim() && model.trim() && characteristics.trim();

    const handleGenerate = async () => {
        if (!canGenerate) return;
        
        setIsLoading(true);
        setError(null);
        // Não limpe os títulos gerados para que eles permaneçam visíveis durante o carregamento de novos
        // setGeneratedTitles(null); 

        try {
            const titles = await generateProductTitles(currentTitle, brand, model, characteristics);
            setGeneratedTitles(titles);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-slate-800/50 p-6 md:p-8 rounded-2xl shadow-2xl shadow-slate-950/50 border border-slate-700 flex flex-col">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-100">Crie o Título do Seu Produto</h2>
                <p className="text-slate-400 mt-2">Otimize seus títulos para Mercado Livre e Shopee com IA.</p>
            </div>

            <div className="flex flex-col space-y-4">
                <input type="text" value={currentTitle} onChange={(e) => setCurrentTitle(e.target.value)} placeholder="Título atual do Produto" className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all" />
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Marca" className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all" />
                <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modelo" className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all" />
                <textarea
                    value={characteristics}
                    onChange={(e) => setCharacteristics(e.target.value)}
                    placeholder="Características Técnicas (ex: 'Bluetooth 5.2, Bateria 20h, à prova d'água')"
                    className="w-full h-24 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none transition-all"
                    rows={3}
                />
                <button
                    onClick={handleGenerate}
                    disabled={!canGenerate || isLoading}
                    className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
                >
                    {isLoading ? 'Gerando...' : 'Gerar Títulos'}
                </button>
            </div>
            
            {isLoading && (
                <div className="text-center mt-6">
                    <p className="text-slate-400">A IA está pesquisando as melhores palavras-chave...</p>
                </div>
            )}

            {error && (
                 <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-center">
                    <p className="text-red-400">{error}</p>
                </div>
            )}
            
            {generatedTitles && (
                <div className="mt-8 border-t border-slate-700 pt-6 animate-fade-in">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-slate-200 mb-3">Título Ideal Para Mercado Livre <span className="text-xs text-slate-400">(60 chars)</span></h3>
                            <ul className="space-y-2">
                               {generatedTitles.mercadoLivre.map((title, i) => <TitleResultItem key={`ml-${i}`} text={title} />)}
                            </ul>
                        </div>
                         <div>
                            <h3 className="font-semibold text-slate-200 mb-3">Título Ideal Para Shopee <span className="text-xs text-slate-400">(100 chars)</span></h3>
                             <ul className="space-y-2">
                               {generatedTitles.shopee.map((title, i) => <TitleResultItem key={`shopee-${i}`} text={title} />)}
                            </ul>
                        </div>
                    </div>
                     <div className="mt-6 text-center">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="text-sm font-semibold text-violet-400 hover:text-violet-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
                        >
                           Gerar Novamente
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
