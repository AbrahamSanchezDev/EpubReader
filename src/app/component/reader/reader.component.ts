import { Component, ViewChild, ElementRef, inject, signal, computed } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { EpubService } from 'src/app/service/epub/epub.service';
import { EpubLoaderService } from 'src/app/service/epub/epub-loader.service';
import { TextToSpeechService } from 'src/app/service/text-to-speech/text-to-speech.service';
import { EpubDisplayComponent } from '../epub/epub-display/epub-display.component';

@Component({
  selector: 'app-reader',
  standalone: true,
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css'],
  imports: [EpubDisplayComponent],
})
export class ReaderComponent {
  @ViewChild('indexMenu') elementRef: ElementRef | null = null;

  filePath = 'assets/TheDefeatedDragon.epub';

  // Signals managed cleanly by Angular reactive context
  book = signal<BookObjModule | null>(null);
  readingAtm = signal<boolean>(false);

  opened = false;
  addedImages = false;
  loadTesting = true;
  showAudioOptions = false;
  pitch = 1.5;
  rate = 1.5;
  volume = 1;

  public epubService = inject(EpubService);
  public loader = inject(EpubLoaderService);
  public textToSpeech = inject(TextToSpeechService);

  // Computed states tracking reactive changes safely
  bookTitle = computed(() => {
    const currentBook = this.book();
    return currentBook?.name?.trim().length ? currentBook.name : 'No book loaded';
  });

  readText = computed(() => {
    return this.readingAtm() ? 'Stop Read aloud' : 'Read aloud';
  });

  indexText = computed(() => {
    return this.book() ? 'Chapters' : 'No book';
  });

  constructor() {
    this.initializeAudioOptions();
    this.registerEvents();
  }

  registerEvents(): void {
    this.epubService.OnFileSelected.subscribe((file) => {
      this.loadEpub(file);
    });
    this.epubService.OnToggleChapters.subscribe(() => {
      this.toggleIndex();
    });
    this.epubService.OnRead.subscribe((read) => {
      this.readingAtm.set(read);
    });
    this.epubService.onLoadProgress.subscribe((progress) => {
      if (progress.done || progress.current >= 90) {
        this.showAudioOptions = true;
      }
    });
    this.epubService.onOpenEpub.subscribe((book) => {
      this.onBookLoaded(book);
    });
    this.epubService.onEpubReady.subscribe((book) => {
      this.onBookLoaded(book);
    });
  }

  initializeAudioOptions(): void {
    this.textToSpeech.getAllVoices();
    setTimeout(() => {
      this.textToSpeech.getVoices();
      this.textToSpeech.setEnglishVoice();
    }, 200);
  }

  onBookLoaded(book: BookObjModule): void {
    if (book == null) {
      console.warn('onBookLoaded called with null book');
      return;
    }
    this.resetData();
    this.book.set(book);
    this.setupButtonsIds();
    this.showAudioOptions = true;
  }

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.loadEpub(element.files[0]);
    }
  }

  loadEpub(file: File) {
    if (file == null) {
      console.warn('No file selected for loading');
      return;
    }
    this.resetData();
    this.loader.loadEpub(file);
  }

  resetData(): void {
    this.book.set(null);
    this.addedImages = false;
    this.epubService.clearIds();
    this.showAudioOptions = false;
  }

  //#region Index Formatting
  setupButtonsIds(): void {
    // CORRECTION: Read signal data using `this.book()` instead of checking the signal class object
    if (this.book() == null || this.book()?.index == null) {
      return;
    }
    if (!this.elementRef) return;

    this.setElementToIndexSaveHtml();

    setTimeout(() => {
      this.getButtonsAndSetThem();
    }, 20);
  }

  getButtonsAndSetThem(): void {
    const currentBook = this.book();
    if (!this.elementRef || !currentBook) return;

    const buttons = this.elementRef.nativeElement.querySelectorAll('button') as HTMLButtonElement[];
    buttons.forEach((button: HTMLButtonElement) => {
      let id = '';
      if (currentBook.usePagesAsMenu) {
        id = button.innerText;
      } else {
        id = button.id;
        button.addEventListener(
          'click',
          () => {
            this.skipTo(id);
          },
          false,
        );
        button.id = '';
      }
      this.addContentId(id);
    });
  }

  addContentId(id: string) {
    this.epubService.addContentId(id);
  }

  setElementToIndexSaveHtml() {
    if (this.elementRef && this.book()) {
      this.elementRef.nativeElement.innerHTML = this.book()?.index ?? '';
    }
  }

  skipTo(id: string) {
    const element = document.getElementById(`${id}`) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
  //#endregion

  //#region Html callbacks

  getBook(): BookObjModule | null {
    return this.book();
  }

  useContentAsMenu(): boolean {
    return this.book()?.usePagesAsMenu ?? false;
  }

  getContent(): PageModule[] | null {
    // CORRECTION: Check signal evaluation condition `this.book() == null`
    if (this.book() == null) {
      console.warn('getContent called but no book is loaded');
      return null;
    }
    return this.book()!.pages;
  }

  getContentName(page: PageModule | null) {
    return page ? page.name : '';
  }

  // Accessing calculated signals safely
  getBookTitle(): string {
    return this.bookTitle();
  }

  getReadText(): string {
    return this.readText();
  }

  getIndexText(): string {
    return this.indexText();
  }

  toggleRead(): void {
    // CORRECTION: Check signal evaluation condition `this.book() == null`
    if (this.book() == null) {
      console.warn('toggleRead called but no book is loaded');
      return;
    }
    this.readingAtm.update((state) => !state);
    this.epubService.OnRead.emit(this.readingAtm());
  }

  showChapters(): void {
    // CORRECTION: Check signal evaluation condition `this.book() == null`
    if (this.book() == null) {
      return;
    }
    this.epubService.toggleChapters();
  }

  readNext(): void {
    // CORRECTION: Check signal evaluation condition `this.book() == null`
    if (this.book() == null) {
      return;
    }
    this.epubService.OnReadNext.emit(true);
  }

  readPreviews(): void {
    // CORRECTION: Check signal evaluation condition `this.book() == null`
    if (this.book() == null) {
      return;
    }
    this.epubService.OnReadNext.emit(false);
  }

  onChangeVoice(voiceName: string) {
    this.textToSpeech.setVoice(voiceName);
  }

  onPitch(value: number) {
    this.pitch = value;
    this.textToSpeech.setPitch(value);
  }

  onRate(value: number) {
    this.rate = value;
    this.textToSpeech.setRate(value);
  }

  onVolume(value: number) {
    this.volume = value;
    this.textToSpeech.setVolume(value);
  }

  getCurrentVoice(): string {
    return this.textToSpeech.selectedValue;
  }
  //#endregion

  toggleIndex(): void {
    this.opened = !this.opened;
    this.epubService.OnShowChapters.emit(this.opened);
    if (this.opened) {
      setTimeout(() => {
        this.setElementToIndexSaveHtml();
        this.getButtonsAndSetThem();
      }, 30);
    }
  }
}
