import { Component, inject } from '@angular/core';
import { EpubService } from 'src/app/service/epub/epub.service';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';

@Component({
  selector: 'app-epub-reader-options',
  standalone: true, // <-- 1. Crucial for modern Angular 21 components
  templateUrl: './epub-reader-options.component.html',
  styleUrls: ['./epub-reader-options.component.css'],
})
export class EpubReaderOptionsComponent {
  // 2. Give these fields clean default starting values to satisfy strict checks
  readingAtm = false;
  hasBook = false;

  // 3. Modern Angular best practice: Use `inject()` for cleaner architecture
  public epubService = inject(EpubService);

  constructor() {
    this.epubService.OnRead.subscribe((read: boolean) => {
      this.onRead(read);
    });
    this.epubService.onOpenEpub.subscribe((book: BookObjModule) => {
      this.hasBook = book != null;
    });
  }

  //Set reading atm
  onRead(read: boolean) {
    this.readingAtm = read;
  }

  //Check if its reading
  reading(): boolean {
    return this.readingAtm;
  }

  //#region HTML Calls
  //Toggle the reading of the text
  toggleRead(): void {
    this.readingAtm = !this.readingAtm;
    this.epubService.OnRead.emit(this.readingAtm);
  }
  //Returns true if the loaded book is not null
  showOptions(): boolean {
    return this.hasBook;
  }
  //Read Next Paragraph
  readNext(): void {
    this.epubService.OnReadNext.emit(true);
  }
  //Read Previews Paragraph
  readPreviews(): void {
    this.epubService.OnReadNext.emit(false);
  }
  //Toggles the chapters menu
  showChapters(): void {
    this.epubService.toggleChapters();
  }
  //Returns the correct text to be display int he read button
  getReadText(): string {
    if (this.readingAtm) {
      return 'Stop Read aloud';
    }
    return 'Read aloud';
  }
  //#endregion
}
