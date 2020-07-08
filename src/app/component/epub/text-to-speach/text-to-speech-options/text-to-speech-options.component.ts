import { Component, OnInit } from '@angular/core';
import { TextToSpeechService } from 'src/app/service/text-to-speech/text-to-speech.service';

@Component({
  selector: 'app-text-to-speech-options',
  templateUrl: './text-to-speech-options.component.html',
  styleUrls: ['./text-to-speech-options.component.css'],
})
export class TextToSpeechOptionsComponent implements OnInit {
  constructor(private textToSpeech: TextToSpeechService) {}

  ngOnInit(): void {}
  getVoices(): string[] {
    return this.textToSpeech.voices;
  }
  onChangeVoice(voiceName: string) {
    this.textToSpeech.selectedValue = voiceName;
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
