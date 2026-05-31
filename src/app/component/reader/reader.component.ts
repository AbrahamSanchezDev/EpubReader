import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { EpubService } from 'src/app/service/epub/epub.service';
import { EpubLoaderService } from 'src/app/service/epub/epub-loader.service';

// 2. Importa tus componentes locales que se ven en el HTML
import { EpubOptionsComponent } from '../epub/epub-options/epub-options.component';
import { EpubReaderComponent } from '../epub/text-to-speech/epub-reader/epub-reader.component';
import { EpubDisplayComponent } from '../epub/epub-display/epub-display.component';
import { EpubReaderOptionsComponent } from '../epub/text-to-speech/epub-reader-options/epub-reader-options.component';

@Component({
  selector: 'app-reader',
  standalone: true, // <-- 1. Componente Moderno Standalone
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css'],
  imports: [
    HttpClientModule,
    EpubOptionsComponent,
    EpubReaderComponent,
    EpubDisplayComponent,
    EpubReaderOptionsComponent,
  ], // <-- Necesario si usas HttpClient localmente
})
export class ReaderComponent {
  @ViewChild('indexMenu') elementRef: ElementRef | null = null;

  filePath = 'assets/TheDefeatedDragon.epub';
  book: BookObjModule | null = null;

  opened = false;
  addedImages = false;
  loadTesting = true;

  // 2. Modern Dependency Injection usando inject()
  private http = inject(HttpClient);
  public epubService = inject(EpubService);
  public loader = inject(EpubLoaderService);

  constructor() {
    this.registerEvents();
  }

  registerEvents(): void {
    this.epubService.OnFileSelected.subscribe((file) => {
      this.loadEpub(file);
    });
    this.epubService.OnToggleChapters.subscribe(() => {
      this.toggleIndex();
    });
    this.epubService.onOpenEpub.subscribe((book) => {
      this.onBookLoaded(book);
    });
  }

  onBookLoaded(book: BookObjModule): void {
    this.resetData();
    this.book = book;
    this.setupButtonsIds();
  }

  // 3. Tipado estricto para eventos nativos del DOM
  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.loadEpub(element.files[0]);
    }
  }

  loadEpub(file: File) {
    if (file == null) {
      return;
    }
    this.resetData();
    this.loader.loadEpub(file);
  }

  resetData(): void {
    this.book = null;
    this.addedImages = false;
    this.epubService.clearIds();
  }

  //#region Index Formatting
  setupButtonsIds(): void {
    // Protección estricta: Validamos que el libro y la referencia existan
    if (this.book == null || this.book.index == null) {
      return;
    }
    if (!this.elementRef) return;

    this.setElementToIndexSaveHtml();

    setTimeout(() => {
      this.getButtonsAndSetThem();
    }, 20);
  }

  getButtonsAndSetThem(): void {
    if (!this.elementRef || !this.book) return;

    const buttons = this.elementRef.nativeElement.querySelectorAll('button') as HTMLButtonElement[];
    buttons.forEach((button: HTMLButtonElement) => {
      let id = '';
      if (this.book!.usePagesAsMenu) {
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
    if (this.elementRef && this.book) {
      this.elementRef.nativeElement.innerHTML = this.book.index;
    }
  }

  skipTo(id: string) {
    const element = document.getElementById(`${id}`) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
  //#endregion

  //#region Html callback

  // Ajuste de firma: Puede retornar null si no hay libro cargado
  getBook(): BookObjModule | null {
    return this.book;
  }

  useContentAsMenu(): boolean {
    if (this.book) {
      return this.book.usePagesAsMenu;
    }
    return false;
  }

  // Ajuste de firma: Agregamos '| null' para que coincida con el return null defensivo
  getContent(): PageModule[] | null {
    if (this.book == null) {
      return null;
    }
    return this.book.pages;
  }

  getContentName(page: PageModule | null) {
    if (page == null) {
      return '';
    }
    return page.name;
  }
  //#endregion

  toggleIndex(): void {
    this.opened = !this.opened;
    this.epubService.OnShowChapters.emit(this.opened);
  }
}
