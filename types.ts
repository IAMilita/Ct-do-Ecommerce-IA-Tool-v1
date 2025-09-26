
export type AppStep = 'upload' | 'generating' | 'results';

export interface GeneratedScene {
  summary: string;
  detailedPrompt: string;
}

export interface FinalImage {
  scene: string;
  images: string[]; // base64 strings
}

export interface GeneratedTitles {
  mercadoLivre: string[];
  shopee: string[];
}

export interface VideoScene {
  title: string;
  prompt: string;
}
