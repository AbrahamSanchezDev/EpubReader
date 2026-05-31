import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  voices: string[] = [];
  allVoices: SpeechSynthesisVoice[] = [];
  speechOptions: SpeechSynthesisUtterance | null = null;
  speech: SpeechSynthesis | null = null;
  reading = false;
  selectedValue = '';

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
      this.getAllVoices();
      this.registerToOnUnload();
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Register to the on unload
  registerToOnUnload(): void {
    if (!this.isBrowser() || !this.speech) {
      return;
    }
    window.onbeforeunload = () => {
      if (this.reading) {
        this.speech?.cancel();
      }
    };
  }

  // Get the voices from the speechSynthesis
  getAllVoices(): void {
    if (!this.isBrowser() || typeof SpeechSynthesisUtterance === 'undefined') {
      return;
    }
    this.speech = window.speechSynthesis;
    this.speech.addEventListener('voiceschanged', () => {
      this.getVoices();
    });
    this.speechOptions = new SpeechSynthesisUtterance();
    this.speechOptions.pitch = 1.5;
    this.speechOptions.rate = 1.5;
    this.speechOptions.volume = 1;
  }

  // Get the voices now that they are available
  getVoices(): void {
    if (!this.speech) {
      return;
    }
    this.allVoices = this.speech.getVoices();
    this.voices = this.allVoices.map((voice) => voice.name.toString());
    this.selectedValue = this.voices[2] ?? '';
  }

  // Cancel speech
  cancelSpeech(): void {
    this.reading = false;
    this.speech?.cancel();
  }

  // Read the text
  read(text: string): void {
    if (!this.speech || !this.speechOptions) {
      return;
    }
    this.speechOptions.text = text;
    for (const voice of this.allVoices) {
      if (voice.name.toString() === this.selectedValue) {
        this.speechOptions.voice = voice;
        break;
      }
    }
    this.speech.speak(this.speechOptions);
  }

  // Set the voice to read with
  setVoice(voice: string): void {
    this.selectedValue = voice;
  }

  // Set voice pitch
  setPitch(value: number): void {
    if (!this.speechOptions) {
      return;
    }
    this.speechOptions.pitch = value;
  }

  // Set voice rate
  setRate(value: number): void {
    if (!this.speechOptions) {
      return;
    }
    this.speechOptions.rate = value;
  }

  // Set voice volume
  setVolume(value: number): void {
    if (!this.speechOptions) {
      return;
    }
    this.speechOptions.volume = value;
  }
}
