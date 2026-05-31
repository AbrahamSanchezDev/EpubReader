import { Component, Renderer2, HostListener, inject, OnDestroy } from '@angular/core';
import { EpubService } from 'src/app/service/epub/epub.service';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule, FormateadParagraph } from 'src/app/model/epub/page/page.module';
import { TextToSpeechService } from 'src/app/service/text-to-speech/text-to-speech.service';
import { SaveDataInLocalStorageService } from 'src/app/service/save-to-local-storage/save-data-in-local-storage.service';

export class ReadData {
  fileName = '';
  curContentIndex = 0;
  curParagraph = 0;
}

@Component({
  selector: 'app-epub-reader',
  standalone: true, // <-- Crucial for Angular 21
  templateUrl: './epub-reader.component.html',
  styleUrls: ['./epub-reader.component.css'],
})
export class EpubReaderComponent implements OnDestroy {
  // 1. Definite Assignment Assertions (!) or safe initial values
  epub!: BookObjModule;
  textToRead!: FormateadParagraph | null;
  curContent!: PageModule;
  reading = false; // Infers boolean type cleanly

  curContentIndex = 0;
  curParagraph = 0;
  curMaxContent = 0;
  curMaxParagraph = 0;

  // 2. Modern Angular Dependency Injection
  private epubService = inject(EpubService);
  private textToSpeech = inject(TextToSpeechService);
  private render = inject(Renderer2);
  private dataSave = inject(SaveDataInLocalStorageService<ReadData>);

  constructor() {
    this.registerToEvents();
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event: BeforeUnloadEvent) {
    this.saveReading();
    console.log('Saved reading progress before unload', event);
  }

  saveReading(): void {
    if (this.epub == null) return;
    const book = this.epub;
    const readData = new ReadData();
    readData.fileName = book.name;
    readData.curContentIndex = this.curContentIndex;
    readData.curParagraph = this.curParagraph;
    this.dataSave.saveDataFor(readData.fileName, readData);
  }

  loadReading(): void {
    if (this.epub == null) return;
    const obj = this.dataSave.loadDataFor(this.epub.name);
    if (obj != null) {
      this.curContentIndex = obj.curContentIndex;
      this.curParagraph = obj.curParagraph;
      this.updateCurrentContent();
      setTimeout(() => {
        this.setFocusOnCurrentParagraph();
      }, 100);
    }
  }

  ngOnDestroy() {
    this.cancelRead();
    if (typeof window !== 'undefined') {
      window.onbeforeunload = null;
    }
    this.saveReading();
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
      this.cancelSpeech();
      this.focusCurrentParagraph(false);
    }
  }

  Read(read: boolean): void {
    if (this.epub == null) {
      return;
    }
    this.reading = read;
    if (read) {
      this.startReading();
    } else {
      this.cancelSpeech();
      this.focusCurrentParagraph(false);
      this.saveReading();
    }
  }

  cancelSpeech(): void {
    this.textToSpeech.cancelSpeech();
  }

  onLoadedBook(epubOpened: BookObjModule): void {
    if (this.epub != null) {
      this.saveReading();
    }
    this.epub = epubOpened;
    this.loadReading();
  }

  getVoices(): string[] {
    return this.textToSpeech.voices;
  }

  startReading() {
    if (!this.curParagraphIsFocus()) {
      this.resetCurrent();
      this.getFirstInView();
    }
    this.updateCurrentContent();
    this.readCurrent();
    if (this.textToSpeech.speechOptions) {
      this.textToSpeech.speechOptions.onend = () => this.readNext();
    }
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
    console.log('No Page is in full view');
  }

  readNext() {
    if (!this.reading) return;

    this.textToRead?.onFinishRead();
    if (this.textToRead?.finished) {
      this.focusCurrentParagraph(false);
      this.textToRead.resetValues();
      this.curParagraph++;
      if (this.curParagraph >= this.curMaxParagraph) {
        this.curContentIndex++;
        if (this.curContentIndex >= this.curMaxContent) {
          console.log('Finish reading');
          return;
        }
        this.updateCurrentContent();
        this.curParagraph = 0;
      }
    }

    this.readCurrent();
  }

  updateCurrentContent(): void {
    this.resetCurrent();
    this.curMaxContent = this.epub.pages.length;
    if (this.curContentIndex >= this.epub.pages.length) {
      this.curContentIndex = this.epub.pages.length - 1;
    }
    this.curContent = this.epub.pages[this.curContentIndex];
    if (this.curContent != null) {
      this.curMaxParagraph = this.curContent.getTotalParagraphs();
    } else {
      console.log('null current content');
    }
  }

  readCurrent(): void {
    this.setFocusOnCurrentParagraph();
    this.focusCurrentParagraph(true);

    this.textToRead = this.curContent.getTextFor(this.curParagraph);
    if (this.textToRead == null) {
      this.skipToNext();
      return;
    }
    this.read(this.textToRead.getTextToRead());
  }

  focusCurrentParagraph(focus: boolean) {
    if (!focus && this.textToRead) {
      this.textToRead.resetValues();
    }
    if (this.curContent) {
      this.setElementToSelected(this.curContent.getParagraphElement(this.curParagraph)!, focus);
    }
  }

  setFocusOnCurrentParagraph(): void {
    const index = this.curParagraph;
    const content = this.curContent;
    if (!content.isValidIndex(index)) {
      console.log('no content');
      return;
    }
    if (!content.isParagraphInFullView(index)) {
      const element = content.getParagraphElement(index);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  curParagraphIsFocus(): boolean {
    const index = this.curParagraph;
    const content = this.epub.pages[this.curContentIndex];
    return content.isParagraphInFullView(index);
  }

  setElementToSelected(element: HTMLElement | null, selected: boolean): void {
    if (element == null) {
      return;
    }
    this.render.setAttribute(element, 'class', selected ? 'selected' : 'text-obj');
  }

  read(text: string) {
    this.textToSpeech.read(text);
  }

  readNextParagraph(next: boolean): void {
    this.cancelRead();
    this.reading = true;
    if (this.textToRead) {
      this.textToRead.resetValues();
    }
    if (next) {
      this.gotToNextParagraph();
    } else {
      this.goToPreviewsParagraph();
    }
  }

  resetCurrent(): void {
    if (this.textToRead) {
      this.textToRead.resetValues();
    }
  }

  gotToNextParagraph(): void {
    this.curParagraph++;
    if (this.curParagraph >= this.curMaxParagraph) {
      this.curParagraph = 0;
      this.curContentIndex++;
      if (this.curContentIndex >= this.curMaxContent) {
        this.reading = false;
        return;
      }
      this.updateCurrentContent();
    }
    this.readCurrent();
  }

  goToPreviewsParagraph(): void {
    this.curParagraph -= 1;
    if (this.curParagraph < 0) {
      if (this.curContentIndex == 0) {
        this.reading = false;
        return;
      }
      this.curContentIndex -= 1;
      this.updateCurrentContent();
      this.curParagraph = this.curMaxParagraph - 1;
    }
    this.readCurrent();
  }

  skipToNext(): void {
    this.curContentIndex++;
    this.updateCurrentContent();
    this.readCurrent();
  }

  skipToPreviews(): void {
    this.curContentIndex++;
    this.updateCurrentContent();
    this.readCurrent();
  }
}
