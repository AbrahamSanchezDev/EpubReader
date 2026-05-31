import { Component, inject, signal } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { EpubService } from 'src/app/service/epub/epub.service';
import { MatDialog } from '@angular/material/dialog';
import { TextToSpeechOptionsComponent } from '../text-to-speech/text-to-speech-options/text-to-speech-options.component';

@Component({
  selector: 'app-epub-options',
  standalone: true,
  templateUrl: './epub-options.component.html',
  styleUrls: ['./epub-options.component.css'],
})
export class EpubOptionsComponent{
  book = signal<BookObjModule | null>(null);
  selectedId = '';
  readingAtm = signal(false);
  showMenu = signal(false);

  public epubService = inject(EpubService);
  public dialog = inject(MatDialog);

  constructor() {
    this.epubService.onOpenEpub.subscribe((epub: BookObjModule) => {
      this.onOpenEpub(epub);
    });
    this.epubService.OnRead.subscribe((read: boolean) => {
      this.onRead(read);
    });
  }

  toggleMenu(): void {
    this.showMenu.set(!this.showMenu());
  }

  closeMenu(): void {
    this.showMenu.set(false);
  }

  onOpenEpub(epub: BookObjModule) {
    // set book signal so template updates reactively
    setTimeout(() => {
      this.book.set(epub);
      // open the menu once a book is loaded so controls are visible
      this.showMenu.set(true);

    }, 5);
  }

  hasBook(): boolean {
    return this.book() != null;
  }

  onRead(read: boolean): void {
    this.readingAtm.set(read);
  }

  readNext(): void {
    this.epubService.OnReadNext.emit(true);
  }

  readPreviews(): void {
    this.epubService.OnReadNext.emit(false);
  }

  //#region Html Calls

  onFileSelected(event: Event) {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      this.epubService.OnFileSelected.emit(element.files[0]);
    }
  }

  toggleRead(): void {
    if (this.book() == null) {
      return;
    }
    this.readingAtm.set(!this.readingAtm());
    this.epubService.OnRead.emit(this.readingAtm());
  }

  showChapters(): void {
    this.epubService.toggleChapters();
  }

  showReadOptions(): void {
    this.dialog.open(TextToSpeechOptionsComponent, {
      width: '80%',
    });
  }

  //#endregion

  getIndexText(): string {
    if (this.book() == null) {
      return '';
    }
    return 'Chapters';
  }

  getReadText(): string {
    if (this.book() == null) {
      return '';
    }
    if (this.readingAtm()) {
      return 'Stop Read aloud';
    }
    return 'Read aloud';
  }
}
