import { Component, inject } from '@angular/core';
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
  book: BookObjModule | null = null;
  selectedId = '';
  readingAtm = false;

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

  onOpenEpub(epub: BookObjModule) {
    setTimeout(() => {
      this.book = epub;
    }, 5);
  }

  hasBook(): boolean {
    return this.book != null;
  }

  onRead(read: boolean): void {
    this.readingAtm = read;
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
    if (this.book == null) {
      return;
    }
    this.readingAtm = !this.readingAtm;
    this.epubService.OnRead.emit(this.readingAtm);
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
    if (this.book == null) {
      return '';
    }
    return 'Chapters';
  }

  getReadText(): string {
    if (this.book == null) {
      return '';
    }
    if (this.readingAtm) {
      return 'Stop Read aloud';
    }
    return 'Read aloud';
  }
}
