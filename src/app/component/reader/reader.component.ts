import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { HttpClient } from '@angular/common/http';
import { EpubService } from 'src/app/service/epub/epub.service';
import { EpubLoaderService } from 'src/app/service/epub/epub-loader.service';

@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css'],
})
export class ReaderComponent implements AfterViewChecked {
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
          this.loadEpub(<File>data);
        }
      });
  }

  onFileSelected(event) {
    this.loadEpub(event.target.files[0]);
  }
  //Called when adding a new file from selector
  loadEpub(file: File) {
    if (file == null) {
      return;
    }
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
  //Chapters index is decided by the book data
  setupButtonsIds(): void {
    if (this.book.index == null) {
      return;
    }
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
  //Get the book object
  getBook(): BookObjModule {
    return this.book;
  }
  //Check if should use the content as menu
  useContentAsMenu(): boolean {
    if (this.book) {
      return this.book.usePagesAsMenu;
    }
    return false;
  }
  //Get the content in the book
  getContent(): PageModule[] {
    if (this.book == null) {
      return null;
    }
    return this.book.pages;
  }
  //Used to set the name of the button when using content as menu
  getContentName(page: PageModule) {
    if (this.book == null) {
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
