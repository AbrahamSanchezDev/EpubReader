import { Component, OnInit, Renderer2, HostListener } from '@angular/core';
import { EpubService } from 'src/app/service/epub/epub.service';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import {
  PageModule,
  FormateadParagraph,
} from 'src/app/model/epub/page/page.module';
import { TextToSpeechService } from 'src/app/service/text-to-speech/text-to-speech.service';
import { SaveDataInLocalStorageService } from 'src/app/service/save-to-local-storage/save-data-in-local-storage.service';

export class ReadData {
  fileName = '';
  curContentIndex = 0;
  curParagraph = 0;
}
@Component({
  selector: 'app-epub-reader',
  templateUrl: './epub-reader.component.html',
  styleUrls: ['./epub-reader.component.css'],
})
export class EpubReaderComponent implements OnInit {
  epub: BookObjModule;
  textToRead: FormateadParagraph;
  curContent: PageModule;

  curContentIndex = 0;
  curParagraph = 0;
  curMaxContent = 0;
  curMaxParagraph = 0;

  constructor(
    private epubService: EpubService,
    private textToSpeech: TextToSpeechService,
    private render: Renderer2,
    private dataSave: SaveDataInLocalStorageService<ReadData>
  ) {
    this.registerToEvents();
  }
  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this.saveReading();
  }
  saveReading(): void {
    if (this.epub == null) return;
    const book = this.epub;
    let readData = new ReadData();
    readData.fileName = book.name;
    readData.curContentIndex = this.curContentIndex;
    readData.curParagraph = this.curParagraph;
    this.dataSave.saveDataFor(readData.fileName, readData);
  }
  loadReading(): void {
    if (this.epub == null) return;
    let obj = this.dataSave.loadDataFor(this.epub.name);
    if (obj != null) {
      this.curContentIndex = obj.curContentIndex;
      this.curParagraph = obj.curParagraph;
      this.updateCurrentContent();
      setTimeout(() => {
        this.setFocusOnCurrentParagraph();
      }, 100);
    }
  }
  ngOnInit(): void {}

  ngOnDestroy() {
    this.cancelRead();
    window.onbeforeunload = null;
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
  reading: boolean;
  Read(read: boolean): void {
    if (this.epub == null) {
      return;
    }
    this.reading = read;
    // console.log('Start Reading ' + read);
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
    // console.log('Loaded book ' + epubOpened.name);
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
    //Check if there is a title in full display if so make it so it reads the title first

    this.readCurrent();
    this.textToSpeech.speechOptions.onend = () => this.readNext();
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

    this.textToRead.onFinishRead();
    if (this.textToRead.finished) {
      this.focusCurrentParagraph(false);
      this.textToRead.resetValues();
      this.curParagraph++;
      if (this.curParagraph >= this.curMaxParagraph) {
        this.curContentIndex++;
        //Check if there is more content to read
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
    if (this.curContent != null)
      this.curMaxParagraph = this.curContent.getTotalParagraphs();
    else {
      console.log('null current content');
    }
    // console.log(this.curContent);
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
      this.setElementToSelected(
        this.curContent.getParagraphElement(this.curParagraph),
        focus
      );
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
      if (element)
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
    this.render.setAttribute(
      element,
      'class',
      selected ? 'selected' : 'text-obj'
    );
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
