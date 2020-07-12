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
    this.registerToOnUnload();
  }
  //Register to the  on unload
  registerToOnUnload(): void {
    window.onbeforeunload = () => {
      if (this.reading) {
        this.speech.cancel();
      }
    };
  }
  //Get the voices from the speechSynthesis
  getAllVoices(): void {
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
  //Cancel speech
  cancelSpeech() {
    this.reading = false;
    this.speech.cancel();
  }
  //Read the text
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
  //Set the voice to read with
  setVoice(voice: string) {
    this.selectedValue = voice;
  }
  //Set voice pitch
  setPitch(value: number) {
    this.speechOptions.pitch = value;
  }
  //Set voice rate
  setRate(value: number) {
    this.speechOptions.rate = value;
  }
  //Set voice volume
  setVolume(value: number) {
    this.speechOptions.volume = value;
  }
}
