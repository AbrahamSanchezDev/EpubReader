import { Component, OnInit } from '@angular/core';
import { EpubService } from 'src/app/service/epub/epub.service';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';

@Component({
  selector: 'app-epub-reader',
  templateUrl: './epub-reader.component.html',
  styleUrls: ['./epub-reader.component.css'],
})
export class EpubReaderComponent implements OnInit {
  selectedValue: string;
  voices: string[] = [];
  allVoices: SpeechSynthesisVoice[] = [];
  SpeechSynthesis: SpeechSynthesisUtterance;
  speech: SpeechSynthesis;

  constructor(private epubService: EpubService) {
    this.registerToEvents();
  }

  ngOnInit(): void {
    this.getAllVoices();
  }

  registerToEvents(): void {
    this.epubService.onOpenEpub.subscribe((book) => this.onLoadedBook(book));
  }
  onLoadedBook(epub: BookObjModule): void {
    console.log('Loaded book ' + epub.name);
  }
  getAllVoices(): void {
    this.speech = window.speechSynthesis;
    this.speech.addEventListener('voiceschanged', () => {
      this.allVoices = speechSynthesis.getVoices();
      for (let i = 0; i < this.allVoices.length; i++) {
        this.voices.push(this.allVoices[i].name.toString());
      }
      this.selectedValue = this.voices[1];
    });
    this.SpeechSynthesis = new SpeechSynthesisUtterance();
  }

  getVoices(): string[] {
    return this.voices;
  }

  testVoice(): void {
    this.SpeechSynthesis.text =
      'While spending a week to recover from the poison of a wild fruit';
    for (let i = 0; i < this.allVoices.length; i++) {
      if (this.allVoices[i].name.toString() == this.selectedValue) {
        this.SpeechSynthesis.voice = this.allVoices[i];
        break;
      }
    }
    this.SpeechSynthesis.pitch = 1.7;
    this.SpeechSynthesis.rate = 1.2;
    this.SpeechSynthesis.volume = 1;
    this.speech.speak(this.SpeechSynthesis);
  }
}
