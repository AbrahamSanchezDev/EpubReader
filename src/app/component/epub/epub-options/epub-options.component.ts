import {
  Component,
  OnInit,
  Renderer2,
  EventEmitter,
  Output,
} from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { EpubService } from 'src/app/service/epub/epub.service';
import { MatDialog } from '@angular/material/dialog';
import { TextToSpeechOptionsComponent } from '../text-to-speach/text-to-speech-options/text-to-speech-options.component';

@Component({
  selector: 'app-epub-options',
  templateUrl: './epub-options.component.html',
  styleUrls: ['./epub-options.component.css'],
})
export class EpubOptionsComponent implements OnInit {
  book: BookObjModule;
  @Output() toggleChapters: EventEmitter<void> = new EventEmitter<void>();

  constructor(
    private epubService: EpubService,
    private render: Renderer2,
    public dialog: MatDialog
  ) {
    epubService.onOpenEpub.subscribe((epub) => {
      this.onOpenEpub(epub);
    });
    epubService.OnRead.subscribe((read) => {
      this.onRead(read);
    });
  }
  ngOnInit(): void {}

  onOpenEpub(epub: BookObjModule) {
    setTimeout(() => {
      this.book = epub;
    }, 5);
  }

  hasBook(): boolean {
    return this.book != null;
  }

  selectedId: string;
  onTest(): void {
    const ids = this.epubService.getIds();
    if (ids.length == 0) {
      console.log('no pages');
      return;
    }
    this.selectedId = ids[0];
    this.checkIfInView(this.selectedId);
  }
  focusOn(): void {
    this.skipTo(this.selectedId);
  }
  //Skip to the given id
  skipTo(id: string) {
    if (id == null) {
      console.log('null id');
      return;
    }
    let element = document.getElementById(`${id}`) as HTMLElement;
    if (element) {
      this.skipToElement(element);
    }
  }
  skipToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  checkIfInView(elementId: string): void {
    let parent = document.getElementById(elementId);
    if (parent == null) {
      console.log('null parent');
      return;
    }
    var position = parent.getBoundingClientRect();
    // checking whether fully visible
    if (position.top >= 0 && position.bottom <= window.innerHeight) {
      console.log('Element is fully visible in screen');
    }
    // checking for partial visibility
    else if (position.top < window.innerHeight && position.bottom >= 0) {
      console.log('Element is partially visible in screen');
    } else {
      console.log('Not in display');
    }
  }
  getFirstInView(): void {
    const pages = this.book.pages;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].pageIsInView()) {
        let obj = pages[i].getFirstInView();
        if (obj) {
          this.render.setAttribute(obj, 'class', 'selected');
          this.skipToElement(obj);
          setTimeout(() => {
            this.render.setAttribute(obj, 'class', '');
          }, 1000);
          console.log('Got obj');
        } else {
          console.log('nothing in full view');
        }

        return;
      }
    }
    console.log('No PAge  is in full view');
  }
  readingAtm: boolean = false;
  toggleRead(): void {
    if (this.book == null) {
      return;
    }
    this.readingAtm = !this.readingAtm;
    this.epubService.OnRead.emit(this.readingAtm);
  }
  onRead(read: boolean) {
    this.readingAtm = read;
  }
  readNext(): void {
    this.epubService.OnReadNext.emit(true);
  }
  readPreviews(): void {
    this.epubService.OnReadNext.emit(false);
  }

  //#region Menu
  onFileSelected(event) {
    // this.fileChanged(event.target.files[0]);
    this.epubService.OnFileSelected.emit(event.target.files[0]);
  }

  showChapters(): void {
    this.toggleChapters.emit();
  }
  //#endregion

  getReadText(): string {
    if (this.book == null) {
      return '';
    }
    if (this.readingAtm) {
      return 'Stop Read aloud';
    }
    return 'Read aloud';
  }
  getIndexText(): string {
    if (this.book == null) {
      return '';
    }
    return 'Chapters';
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }

    return value;
  }

  showReadOptions(): void {
    const dialogRef = this.dialog.open(TextToSpeechOptionsComponent, {
      width: '80%',
    });
  }
}
