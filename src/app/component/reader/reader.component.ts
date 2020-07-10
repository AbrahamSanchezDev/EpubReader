import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { SafeHtml } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { EpubService } from 'src/app/service/epub/epub.service';
import { EpubLoaderService } from 'src/app/service/epub/epub-loader.service';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css'],
})
export class ReaderComponent implements AfterViewChecked {
  @ViewChild('bookArea') bookArea;
  @ViewChild('indexMenu') elementRef: ElementRef;

  filePath = 'assets/TheDefeatedDragon.epub';

  book: BookObjModule;

  opened: boolean = false;

  addedImages: boolean = false;

  constructor(
    private http: HttpClient,
    private epubService: EpubService,
    private loader: EpubLoaderService
  ) {
    this.registerEvents();
    this.loadTestingFile();
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

  //Add the events to the menu index after the inner html is updated
  ngAfterViewChecked(): void {}
  public ngAfterViewInit(): void {}

  ngOnInit(): void {}
  onBookLoaded(book: BookObjModule): void {
    this.resetData();
    this.book = book;
    this.setupButtonsIds();
  }

  loadTestingFile() {
    let filePath = 'assets/epub/';
    let dragons = 'The Defeated Dragon 1 - 100.epub';
    let alchemist = 'The Alchemist God.epub';
    let devils = 'Devils Son in Law.epub';
    let fileName = alchemist;
    this.http
      .get(filePath + fileName, { responseType: 'blob' })
      .subscribe((data) => {
        if (data != null) {
          this.loadEpub(data);
        }
      });
  }

  onFileSelected(event) {
    this.loadEpub(event.target.files[0]);
  }
  //Called when adding a new file from selector
  loadEpub(file) {
    this.resetData();
    this.loader.loadEpub(file);
  }

  //Reset the values to default
  resetData(): void {
    this.book = null;
    this.addedImages = false;
    this.epubService.clearIds();
  }
  //#region Index Formatting
  setupButtonsIds(): void {
    if (this.elementRef) {
      this.elementRef.nativeElement.innerHTML = this.book.index;
      // //Remove old content
      setTimeout(() => {
        let buttons = this.elementRef.nativeElement.querySelectorAll(
          'button'
        ) as HTMLButtonElement[];

        buttons.forEach((button: HTMLButtonElement) => {
          let id = '';
          if (this.book.usePagesAsMenu) {
            id = button.innerText;
          } else {
            id = button.id;
            button.addEventListener(
              'click',
              (e) => {
                //call to skip to the same id as the element
                this.skipTo(id);
              },
              false
            );
            button.id = '';
          }
          this.epubService.addContentId(id);
        }, 50);
      });
    }
  }
  //Skip to the given id
  skipTo(id: string) {
    let element = document.getElementById(`${id}`) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
  //#endregion

  //#region Html callback
  hasBook(): boolean {
    return this.book != null;
  }
  getBook(): BookObjModule {
    return this.book;
  }
  getBookName(): string {
    if (this.book == null) {
      return '';
    }
    return this.book.name;
  }
  getContent(): PageModule[] {
    if (this.book == null) {
      return null;
    }
    return this.book.pages;
  }
  getContentData(obj: PageModule) {
    return obj.content;
  }

  getContentName(page: PageModule) {
    if (this.book == null) {
      return '';
    }
    return page.name;
  }
  //Chapters index is decided by the book data
  getIndexContent(): SafeHtml {
    if (this.book == null) {
      return '';
    }
    return this.book.index;
  }

  //#endregion

  toggleIndex(): void {
    this.opened = !this.opened;
    this.epubService.OnShowChapters.emit(this.opened);
  }
}
