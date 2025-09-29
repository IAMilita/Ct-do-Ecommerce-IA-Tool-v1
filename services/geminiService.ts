
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { 
    SCENE_GENERATION_PROMPT_TEMPLATE, 
    IMAGE_GENERATION_PROMPT_TEMPLATE,
    PROMPT_WHITE_BACKGROUND,
    PROMPT_DIFFERENT_ANGLES,
    PROMPT_TECHNICAL_INFO,
    PROMPT_MEASUREMENT_TABLE,
    TITLE_GENERATION_PROMPT_TEMPLATE,
    DESCRIPTION_GENERATION_PROMPT_TEMPLATE,
    VIDEO_SCENE_GENERATION_PROMPT_TEMPLATE,
    AUDIO_SCRIPT_GENERATION_PROMPT_TEMPLATE,
} from '../prompts';
import { GeneratedScene, GeneratedTitles, VideoScene } from "../types";

// Fix: Adhere to coding guidelines by obtaining the API key exclusively from environment variables.
// The `process.env.API_KEY` is assumed to be pre-configured and valid.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const sceneGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        scenes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    summary: {
                        type: Type.STRING,
                        description: 'A short, evocative summary of the scene (max 10 words).',
                    },
                    detailedPrompt: {
                        type: Type.STRING,
                        description: 'A highly detailed visual prompt for an image generation AI.',
                    },
                },
                required: ['summary', 'detailedPrompt'],
            },
        },
    },
    required: ['scenes'],
};

const titleGenerationSchema = {
    type: Type.OBJECT,
    properties: {
        mercadoLivre: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '5 optimized titles for Mercado Livre (max 60 characters each).',
        },
        shopee: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '5 optimized titles for Shopee (max 100 characters each).',
        }
    },
    required: ['mercadoLivre', 'shopee'],
};


export const generateScenes = async (images: {base64: string, mimeType: string}[], description: string, category: string): Promise<GeneratedScene[]> => {
    try {
        const systemInstruction = SCENE_GENERATION_PROMPT_TEMPLATE(description, category);
        const imageParts = images.map(image => ({
            inlineData: { data: image.base64, mimeType: image.mimeType }
        }));

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: {
                parts: [
                    ...imageParts,
                    { text: "Analise as imagens e a descrição do produto fornecidas nas instruções e gere as cenas." }
                ]
            },
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: sceneGenerationSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);

        if (parsedJson && Array.isArray(parsedJson.scenes)) {
            const validScenes = parsedJson.scenes.filter(
                (scene: any): scene is GeneratedScene => 
                    scene && typeof scene.summary === 'string' && typeof scene.detailedPrompt === 'string'
            );
            return validScenes.slice(0, 5); // Ensure only 5 scenes are returned
        }
        throw new Error("Formato de resposta inválido da API de geração de cena.");

    } catch (error) {
        console.error("Erro ao gerar cenas:", error);
        throw new Error("Falha ao gerar cenas do modelo de IA.");
    }
};

export const generateProductImage = async (productImages: {base64: string, mimeType: string}[], scenePrompt: string): Promise<string> => {
    try {
        const fullPrompt = IMAGE_GENERATION_PROMPT_TEMPLATE(scenePrompt);
        const imageParts = productImages.map(image => ({
            inlineData: { data: image.base64, mimeType: image.mimeType }
        }));

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    ...imageParts,
                    { text: fullPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const parts = response.candidates?.[0]?.content?.parts;

        if (parts) {
            for (const part of parts) {
                if (part.inlineData) {
                    return part.inlineData.data;
                }
            }
        }

        throw new Error("Nenhuma imagem foi gerada pelo modelo.");

    } catch (error) {
        console.error("Erro ao gerar a imagem do produto:", error);
        throw new Error("Falha ao gerar a imagem do produto.");
    }
};

export const generateEcommerceImageSet = async (productImages: {base64: string, mimeType: string}[], description: string, category: string): Promise<string[]> => {
    try {
        // 1. Generate usage scene ideas first
        const usageSceneIdeas = await generateScenes(productImages, description, category);
        // We need 3 usage scenes for the final images
        const usageScenePrompts = usageSceneIdeas.slice(0, 3).map(scene => scene.detailedPrompt);

        // 2. Define all prompts for the 7 images
        const prompts: string[] = [
            PROMPT_WHITE_BACKGROUND,
            PROMPT_DIFFERENT_ANGLES,
            PROMPT_TECHNICAL_INFO,
            PROMPT_MEASUREMENT_TABLE,
            ...usageScenePrompts
        ];

        // Fallback in case scene generation yields fewer than 3 ideas
        const genericUsageScene = "Uma foto de estilo de vida do produto sendo usado em um ambiente moderno e bem iluminado, focando nos benefícios e na experiência do usuário.";
        while (prompts.length < 7) {
            prompts.push(genericUsageScene);
        }
        
        // Ensure we have exactly 7 prompts
        const finalPrompts = prompts.slice(0, 7);

        // 3. Generate all 7 images in parallel
        const imagePromises = finalPrompts.map(prompt =>
            generateProductImage(productImages, prompt)
        );

        const generatedImages = await Promise.all(imagePromises);
        return generatedImages;

    } catch (error) {
        console.error("Erro ao gerar o conjunto de imagens de e-commerce:", error);
        throw new Error("Falha ao gerar o conjunto completo de imagens.");
    }
};


export const generateProductTitles = async (currentTitle: string, brand: string, model: string, characteristics: string): Promise<GeneratedTitles> => {
    try {
        const prompt = TITLE_GENERATION_PROMPT_TEMPLATE(currentTitle, brand, model, characteristics);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: titleGenerationSchema,
            },
        });

        const jsonText = response.text.trim();
        // Sometimes the model might wrap the JSON in markdown backticks
        const cleanedJsonText = jsonText.replace(/^```json\s*|```$/g, '');
        const parsedJson = JSON.parse(cleanedJsonText);

        // Basic validation
        if (parsedJson && Array.isArray(parsedJson.mercadoLivre) && Array.isArray(parsedJson.shopee)) {
            return parsedJson as GeneratedTitles;
        }

        throw new Error("Formato de resposta JSON inválido da API de geração de título.");

    } catch (error) {
        console.error("Erro ao gerar títulos:", error);
        throw new Error("Falha ao gerar títulos do modelo de IA. Verifique o formato da resposta.");
    }
};

export const generateProductDescription = async (productTitle: string, modelDescription: string): Promise<string> => {
    try {
        const prompt = DESCRIPTION_GENERATION_PROMPT_TEMPLATE(productTitle, modelDescription);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        return response.text;
        
    } catch (error) {
        console.error("Erro ao gerar descrição:", error);
        throw new Error("Falha ao gerar a descrição do produto a partir do modelo de IA.");
    }
};


export const generateVideoScenes = async (title: string, description: string, images: { base64: string, mimeType: string }[]): Promise<VideoScene[]> => {
    try {
        const prompt = VIDEO_SCENE_GENERATION_PROMPT_TEMPLATE(title, description);
        const imageParts = images.map(img => ({ inlineData: { data: img.base64, mimeType: img.mimeType } }));

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [...imageParts, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
            },
        });

        const jsonText = response.text.trim().replace(/^```json\s*|```$/g, '');
        const parsedJson = JSON.parse(jsonText);

        if (Array.isArray(parsedJson) && parsedJson.every(item => item.title && item.prompt)) {
            return parsedJson as VideoScene[];
        }
        
        throw new Error("Formato de resposta de cena de vídeo inválido.");

    } catch (error) {
        console.error("Erro ao gerar cenas de vídeo:", error);
        throw new Error("Falha ao gerar o roteiro do vídeo.");
    }
};

export const generateSingleProductVideo = async (scene: VideoScene, images: { base64: string, mimeType: string }[]) => {
    try {
        const finalPrompt = `Crie um vídeo de 8 segundos em formato 9:16 (vertical para Reels e Shorts). O vídeo deve ser dinâmico, profissional, cinematográfico e seguir estritamente este roteiro: \n\nCena: ${scene.title}\n${scene.prompt}`;
        
        const operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: finalPrompt,
            image: images.length > 0 ? {
                imageBytes: images[0].base64,
                mimeType: images[0].mimeType,
            } : undefined,
            config: {
                numberOfVideos: 1,
            }
        });
        return operation;
    } catch (error) {
        console.error(`Erro ao iniciar a geração de vídeo para cena "${scene.title}":`, error);
        throw new Error(`Falha ao iniciar a geração do vídeo para a cena "${scene.title}".`);
    }
};

export const getPollingVideosOperation = async (operation: any) => {
    try {
        return await ai.operations.getVideosOperation({ operation: operation });
    } catch (error) {
        console.error("Erro ao pesquisar operação de vídeo:", error);
        throw new Error("Falha ao verificar o status da geração do vídeo.");
    }
};

export const generateVideoAudioScript = async (scenes: VideoScene[]): Promise<string> => {
    try {
        const prompt = AUDIO_SCRIPT_GENERATION_PROMPT_TEMPLATE(scenes);

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
        
    } catch (error) {
        console.error("Erro ao gerar roteiro de áudio:", error);
        throw new Error("Falha ao gerar o roteiro de áudio do vídeo.");
    }
};