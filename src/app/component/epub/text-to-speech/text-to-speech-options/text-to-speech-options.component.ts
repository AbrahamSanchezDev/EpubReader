import { Component, OnInit, inject } from '@angular/core';
import { TextToSpeechService } from 'src/app/service/text-to-speech/text-to-speech.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-text-to-speech-options',
  standalone: true, // <-- Crucial for modern Angular components!
  templateUrl: './text-to-speech-options.component.html',
  styleUrls: ['./text-to-speech-options.component.css'],
  imports: [
  ],
})
export class TextToSpeechOptionsComponent implements OnInit {
  public textToSpeech = inject(TextToSpeechService);
  public dialogRef = inject(MatDialogRef<TextToSpeechOptionsComponent>);

  ngOnInit(): void {
    console.log(this.textToSpeech);
  }

  getVoices(): string[] {
    return this.textToSpeech.voices;
  }

  //Set the voice in the text speech service
  onChangeVoice(voiceName: string) {
    this.textToSpeech.setVoice(voiceName);
  }

  getCurrentVoice(): string {
    return this.textToSpeech.selectedValue;
  }

  //Set the pitch in the text speech service
  onPitch(value: number) {
    this.textToSpeech.setPitch(value);
  }

  //Set the rate in the text speech service
  onRate(value: number) {
    this.textToSpeech.setRate(value);
  }

  //Set the volume in the text speech service
  onVolume(value: number) {
    this.textToSpeech.setVolume(value);
  }
}
