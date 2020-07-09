import { Component, OnInit } from '@angular/core';
import { TextToSpeechService } from 'src/app/service/text-to-speech/text-to-speech.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-text-to-speech-options',
  templateUrl: './text-to-speech-options.component.html',
  styleUrls: ['./text-to-speech-options.component.css'],
})
export class TextToSpeechOptionsComponent implements OnInit {
  constructor(
    private textToSpeech: TextToSpeechService,
    public dialogRef: MatDialogRef<TextToSpeechOptionsComponent>
  ) {}

  ngOnInit(): void {}
  getVoices(): string[] {
    return this.textToSpeech.voices;
  }
  onChangeVoice(voiceName: string) {
    this.textToSpeech.setVoice(voiceName);
  }
  getCurrentVoice(): string {
    return this.textToSpeech.selectedValue;
  }
  onPitch(value: number) {
    this.textToSpeech.setPitch(value);
  }
  onRate(value: number) {
    this.textToSpeech.setRate(value);
  }
  onVolume(value: number) {
    this.textToSpeech.setVolume(value);
  }
}
