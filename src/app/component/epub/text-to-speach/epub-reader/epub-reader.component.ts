import { Component, OnInit, Renderer2 } from '@angular/core';
import { EpubService } from 'src/app/service/epub/epub.service';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';

@Component({
  selector: 'app-epub-reader',
  templateUrl: './epub-reader.component.html',
  styleUrls: ['./epub-reader.component.css'],
})
export class EpubReaderComponent implements OnInit {
  selectedValue: string;
  voices: string[] = [];
  allVoices: SpeechSynthesisVoice[] = [];
  speechOptions: SpeechSynthesisUtterance;
  speech: SpeechSynthesis;

  epub: BookObjModule;

  constructor(private epubService: EpubService, private render: Renderer2) {
    this.registerToEvents();
  }

  ngOnInit(): void {
    this.getAllVoices();
    window.onbeforeunload = () => {
      if (this.reading) {
        this.speech.cancel();
        console.log('Was reading');
      }
    };
  }

  ngOnDestroy() {
    this.cancelRead();
    window.onbeforeunload = null;
  }
  registerToEvents(): void {
    this.epubService.onOpenEpub.subscribe((book) => {
      this.onLoadedBook(book);
    });
    this.epubService.OnRead.subscribe((read) => {
      this.Read(read);
    });
    this.epubService.OnReadNext.subscribe((next) => {
      this.readNextParagraph(next);
    });
  }
  cancelRead(): void {
    if (this.reading) {
      this.reading = false;
      this.speech.cancel();
      this.focusCurrentParagraph(false);
      this.focusParent(false);
    }
  }
  reading: boolean;
  Read(read: boolean): void {
    this.reading = read;
    console.log('Start Reading ' + read);
    if (read) {
      this.startReading();
    } else {
      this.speech.cancel();
      this.focusCurrentParagraph(false);
      this.focusParent(false);
    }
  }

  onLoadedBook(epubOpened: BookObjModule): void {
    console.log('Loaded book ' + epubOpened.name);
    this.epub = epubOpened;
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
  }

  getVoices(): string[] {
    return this.voices;
  }

  curContentIndex = 0;
  curContent: PageModule;
  curParagraph = 0;
  curMaxContent = 0;
  curMaxParagraph = 0;
  readTitle: boolean = false;
  titleRead: boolean = false;

  startReading() {
    if (!this.curParagraphIsFocus()) {
      this.getFirstInView();
    }
    this.updateCurrentContent();
    //Check if there is a title in full display if so make it so it reads the title first
    if (this.titleRead == false) {
      this.readTitle = this.curContent.pageIsInFullView();
    }

    this.readCurrent();
    this.speechOptions.onend = () => this.readNext();
  }

  getFirstInView() {
    const pages = this.epub.pages;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].pageIsInView()) {
        this.curContentIndex = i;
        this.curParagraph = pages[i].getFirstInViewIndex();
        return;
      }
    }
    console.log('No PAge  is in full view');
  }
  readNext() {
    if (!this.reading) return;
    this.focusCurrentParagraph(false);
    this.curParagraph++;
    if (this.readTitle) {
      this.readTitle = false;
      this.curParagraph--;
      this.focusParent(false);
      this.titleRead = true;
    }
    if (this.curParagraph >= this.curMaxParagraph) {
      this.curContentIndex++;
      //Check if there is more content to read
      if (this.curContentIndex >= this.curMaxContent) {
        console.log('Finish reading');
        return;
      }
      this.updateCurrentContent();
      this.curParagraph = 0;
      this.readTitle = true;
      this.titleRead = false;
    }

    this.readCurrent();
  }
  updateCurrentContent(): void {
    this.curMaxContent = this.epub.pages.length;
    this.curContent = this.epub.pages[this.curContentIndex];
    this.curMaxParagraph = this.curContent.getTotalParagraphs();
  }
  readCurrent(): void {
    if (this.readTitle) {
      this.focusParent(true);
      this.read(this.curContent.name);
      this.curContent.focusOnParent();
    } else {
      this.setFocusOnCurrentParagraph();
      this.focusCurrentParagraph(true);
      this.read(this.curContent.getTextFor(this.curParagraph));
    }
  }
  focusParent(focus: boolean): void {
    this.setElementToSelected(this.curContent.getParent(), focus);
  }
  focusCurrentParagraph(focus: boolean) {
    this.setElementToSelected(
      this.curContent.getParagraphElement(this.curParagraph),
      focus
    );
  }
  setFocusOnCurrentParagraph(): void {
    const index = this.curParagraph;
    const content = this.curContent;
    if (!content.isValidIndex(index)) {
      return;
    }
    if (!content.isParagraphInFullView(index)) {
      const element = content.getParagraphElement(index);
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  curParagraphIsFocus(): boolean {
    const index = this.curParagraph;
    const content = this.epub.pages[this.curContentIndex];
    return content.isParagraphInFullView(index);
  }
  setElementToSelected(element: HTMLElement, selected: boolean): void {
    if (element == null) {
      return;
    }
    this.render.setAttribute(element, 'class', selected ? 'selected' : '');
  }
  read(text: string) {
    this.speechOptions.text = text;
    for (let i = 0; i < this.allVoices.length; i++) {
      if (this.allVoices[i].name.toString() == this.selectedValue) {
        this.speechOptions.voice = this.allVoices[i];
        break;
      }
    }
    this.speechOptions.pitch = 1.5;
    this.speechOptions.rate = 1.5;
    this.speechOptions.volume = 1;
    this.speech.speak(this.speechOptions);
  }
  readNextParagraph(next: boolean): void {
    this.cancelRead();
    this.reading = true;
    if (next) {
      this.readNext();
    } else {
      this.curParagraph -= 2;
      if (this.curParagraph < 0) {
        if (this.curContentIndex == 0) {
          this.reading = false;
          return;
        }
        this.curContentIndex--;
        this.updateCurrentContent();
        this.curContentIndex = this.curMaxParagraph;
      }
      this.readNext();
    }
  }
}
