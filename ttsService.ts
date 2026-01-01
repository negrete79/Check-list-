
export class TTSService {
  private synth: SpeechSynthesis;
  private browserVoice: SpeechSynthesisVoice | null = null;
  private listeners: ((speaking: boolean) => void)[] = [];

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadBrowserVoice();
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadBrowserVoice();
    }
  }

  private loadBrowserVoice() {
    const voices = this.synth.getVoices();
    // Prioridade para vozes brasileiras femininas nativas do sistema
    this.browserVoice = 
      voices.find(v => v.lang.includes('pt-BR') && v.name.includes('Google')) ||
      voices.find(v => v.lang.includes('pt-BR') && (v.name.includes('Maria') || v.name.includes('Luciana') || v.name.includes('Heloisa'))) ||
      voices.find(v => v.lang.includes('pt-BR')) || 
      null;
  }

  onStatusChange(callback: (speaking: boolean) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(speaking: boolean) {
    this.listeners.forEach(l => l(speaking));
  }

  async speak(text: string) {
    if (!this.synth) return;
    if (this.synth.speaking) {
      this.synth.cancel();
    }

    this.notify(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.browserVoice;
    utterance.lang = 'pt-BR';
    utterance.pitch = 1.05; 
    utterance.rate = 1.0; 

    utterance.onend = () => this.notify(false);
    utterance.onerror = () => this.notify(false);
    
    this.synth.speak(utterance);
  }
}

export const ttsService = new TTSService();
