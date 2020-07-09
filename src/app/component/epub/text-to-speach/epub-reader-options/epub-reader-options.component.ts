import { Component, OnInit } from '@angular/core';
import { EpubService } from 'src/app/service/epub/epub.service';

@Component({
  selector: 'app-epub-reader-options',
  templateUrl: './epub-reader-options.component.html',
  styleUrls: ['./epub-reader-options.component.css'],
})
export class EpubReaderOptionsComponent implements OnInit {
  readingAtm: boolean;

  constructor(private epubService: EpubService) {
    epubService.OnRead.subscribe((read) => {
      this.onRead(read);
    });
  }

  onRead(read: boolean) {
    this.readingAtm = read;
  }
  ngOnInit(): void {}
  reading(): boolean {
    return this.readingAtm;
  }

  toggleRead(): void {
    this.readingAtm = !this.readingAtm;
    this.epubService.OnRead.emit(this.readingAtm);
  }

  readNext(): void {
    this.epubService.OnReadNext.emit(true);
  }
  readPreviews(): void {
    this.epubService.OnReadNext.emit(false);
  }
  showChapters(): void {
    this.epubService.toggleChapters();
  }
  getReadText(): string {
    if (this.readingAtm) {
      return 'Stop Read aloud';
    }
    return 'Read aloud';
  }
}
