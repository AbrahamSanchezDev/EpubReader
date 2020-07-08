import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TextToSpeechService {
  voices: string[] = [];
  allVoices: SpeechSynthesisVoice[] = [];
  speechOptions: SpeechSynthesisUtterance;
  speech: SpeechSynthesis;
  reading: boolean;
  selectedValue: string;

  constructor() {
    this.getAllVoices();
    window.onbeforeunload = () => {
      if (this.reading) {
        this.speech.cancel();
        console.log('Was reading');
      }
    };
  }
  getAllVoices(): void {
    if (!('speechSynthesis' in window)) {
      console.log("You don't have speechSynthesis");
    }
    this.speech = window.speechSynthesis;
    this.speech.addEventListener('voiceschanged', () => {
      this.allVoices = speechSynthesis.getVoices();
      for (let i = 0; i < this.allVoices.length; i++) {
        this.voices.push(this.allVoices[i].name.toString());
      }
      this.selectedValue = this.voices[2];
    });
    this.speechOptions = new SpeechSynthesisUtterance();
    this.speechOptions.pitch = 1.5;
    this.speechOptions.rate = 1.5;
    this.speechOptions.volume = 1;
  }

  cancelSpeech() {
    this.reading = false;
    this.speech.cancel();
  }
  read(text: string) {
    this.speechOptions.text = text;
    for (let i = 0; i < this.allVoices.length; i++) {
      if (this.allVoices[i].name.toString() == this.selectedValue) {
        this.speechOptions.voice = this.allVoices[i];
        break;
      }
    }
    this.speech.speak(this.speechOptions);
  }
  setPitch(value: number) {
    this.speechOptions.pitch = value;
  }
  setRate(value: number) {
    this.speechOptions.rate = value;
  }
  setVolume(value: number) {
    this.speechOptions.volume = value;
  }
}
