
export enum AppView {
  CHAT = 'CHAT',
  IMAGE_GEN = 'IMAGE_GEN',
  VOICE_LIVE = 'VOICE_LIVE',
  SEARCH = 'SEARCH'
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export interface SearchResult {
  title: string;
  uri: string;
}
