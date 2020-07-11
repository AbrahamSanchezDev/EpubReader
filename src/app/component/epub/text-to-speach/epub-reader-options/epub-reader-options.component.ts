import { Component, OnInit } from '@angular/core';
import { EpubService } from 'src/app/service/epub/epub.service';

@Component({
  selector: 'app-epub-reader-options',
  templateUrl: './epub-reader-options.component.html',
  styleUrls: ['./epub-reader-options.component.css'],
})
export class EpubReaderOptionsComponent implements OnInit {
  readingAtm: boolean;

  hasBook: boolean;
  constructor(private epubService: EpubService) {
    epubService.OnRead.subscribe((read) => {
      this.onRead(read);
    });
    epubService.onOpenEpub.subscribe((book) => {
      this.hasBook = book != null;
    });
  }

  onRead(read: boolean) {
    this.readingAtm = read;
  }
  ngOnInit(): void {}
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
