import { Component, OnInit, Renderer2 } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { EpubService } from 'src/app/service/epub/epub.service';
import { MatDialog } from '@angular/material/dialog';
import { TextToSpeechOptionsComponent } from '../text-to-speech/text-to-speech-options/text-to-speech-options.component';

@Component({
  selector: 'app-epub-options',
  templateUrl: './epub-options.component.html',
  styleUrls: ['./epub-options.component.css'],
})
export class EpubOptionsComponent implements OnInit {
  book: BookObjModule;
  selectedId: string;
  readingAtm: boolean = false;
  constructor(
    public epubService: EpubService,
    private render: Renderer2,
    public dialog: MatDialog
  ) {
    epubService.onOpenEpub.subscribe((epub: BookObjModule) => {
      this.onOpenEpub(epub);
    });
    epubService.OnRead.subscribe((read: boolean) => {
      this.onRead(read);
    });
  }
  ngOnInit(): void {}
  //Should set the book after some delay
  onOpenEpub(epub: BookObjModule) {
    setTimeout(() => {
      this.book = epub;
    }, 5);
  }
  //Returns  if has a book
  hasBook(): boolean {
    return this.book != null;
  }
  //Change the reading state
  onRead(read: boolean): void {
    this.readingAtm = read;
  }
  //Call read next event
  readNext(): void {
    this.epubService.OnReadNext.emit(true);
  }
  //Call read previews event
  readPreviews(): void {
    this.epubService.OnReadNext.emit(false);
  }

  //#region Html Calls

  //#region Menu

  //Send the event that there was a file selected
  onFileSelected(event) {
    this.epubService.OnFileSelected.emit(event.target.files[0]);
  }
  //Toggle the read state
  toggleRead(): void {
    if (this.book == null) {
      return;
    }
    this.readingAtm = !this.readingAtm;
    this.epubService.OnRead.emit(this.readingAtm);
  }
  //Toggle show chapters
  showChapters(): void {
    this.epubService.toggleChapters();
  }
  //Show the menu pop up
  showReadOptions(): void {
    const dialogRef = this.dialog.open(TextToSpeechOptionsComponent, {
      width: '80%',
    });
  }

  //#endregion

  //Returns the text to display on the menu for showing chapters
  getIndexText(): string {
    if (this.book == null) {
      return '';
    }
    return 'Chapters';
  }
  //Returns the text to display for read out load menu
  getReadText(): string {
    if (this.book == null) {
      return '';
    }
    if (this.readingAtm) {
      return 'Stop Read aloud';
    }
    return 'Read aloud';
  }
  //#endregion
}
