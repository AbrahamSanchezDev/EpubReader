import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ViewContainerRef,
} from '@angular/core';
import { ZipService } from 'src/app/service/zip/zip.service';
import { ZipEntry } from 'src/app/service/zip/ZipEntry';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { TextReplaceData } from 'src/app/interface/text-replace-data';
import { EpubTextFormatService } from 'src/app/service/epub/epub-text-format.service';
import { HttpClient } from '@angular/common/http';
import { EpubService } from 'src/app/service/epub/epub.service';

const navOptions: TextReplaceData = {
  beginString: 'href="',
  midString: 'tml#',
  replaceMidFor: '',
  removeFromTo: [
    //Remove the Nav
    { replaceFor: '<div class= "menu">', original: '<nav', originalEnd: '>' },
  ],
  replaceText: [
    {
      original: '</display:>',
      replaceFor: '</div>',
    },
    {
      //Replace the <a></a> link html to Button
      original: '<a ',
      replaceFor: '<button class ="index-obj" type="button" id ="',
    },
    {
      //Replace the <a></a> link html to Button
      original: '</a>',
      replaceFor: '</button>',
    },
  ],
  removeAllTags: ['ol', 'li'],
};
@Component({
  selector: 'app-reader',
  templateUrl: './reader.component.html',
  styleUrls: ['./reader.component.css'],
})
export class ReaderComponent implements AfterViewChecked {
  @ViewChild('bookArea') bookArea;
  @ViewChild('indexMenu') elementRef: ElementRef;
  @ViewChild('content', { read: ViewContainerRef })
  filePath = 'assets/TheDefeatedDragon.epub';

  added: boolean;
  addedImages: boolean = false;

  book: BookObjModule;
  currentFiles: number;
  currentMaxFiles: number;
  contentClass: string = '';

  constructor(
    private zip: ZipService,
    private textControl: EpubTextFormatService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private epubService: EpubService
  ) {
    this.loadTestingFile();
  }

  //Add the events to the menu index after the inner html is updated
  ngAfterViewChecked(): void {
    this.addEvents();
  }
  public ngAfterViewInit(): void {}
  //Add the events to the menu index
  addEvents() {
    if (this.added) return;
    let buttons = this.elementRef.nativeElement.querySelectorAll(
      'button'
    ) as HTMLButtonElement[];
    buttons.forEach((button: HTMLButtonElement) => {
      let id = button.id;
      button.addEventListener(
        'click',
        (e) => {
          //call to skip to the same id as the element
          this.skipTo(id);
        },
        false
      );
      button.id = '';
      this.added = true;
    });
  }

  ngOnInit(): void {}

  loadTestingFile() {
    let filePath = 'assets/epub/';
    let dragons = 'The Defeated Dragon 1 - 100.epub';
    let alchemist = 'The Alchemist God.epub';
    let devils = 'Devils Son in Law.epub';
    let fileName = dragons;
    this.http
      .get(filePath + fileName, { responseType: 'blob' })
      .subscribe((data) => {
        if (data != null) {
          this.fileChanged(data);
        }
      });
  }
  onFileSelected(event) {
    this.fileChanged(event.target.files[0]);
  }
  //Called when adding a new file from selector
  fileChanged(file) {
    this.contentClass = 'left';
    this.resetData();

    this.zip.getEntries(file).subscribe((data: ZipEntry[]) => {
      for (let i = 0; i < data.length; i++) {
        const name = data[i].filename;
        if (name.includes('book.opf')) {
          this.loadFileName(data[i]);
          break;
        }
      }
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
        const name = data[i].filename;
        //img = .png
        if (this.isAnImg(name)) {
          this.loadImg(data[i]);
        }
      }
      for (let i = 0; i < data.length; i++) {
        const name = data[i].filename;
        //htmls = ".xhtml"
        if (name.includes('.xhtml')) {
          //directory = nav.xhtml
          if (this.isAnIndexer(name)) {
            this.loadIndex(data[i]);
          }
          //Content
          else {
            this.currentMaxFiles++;
            // console.log('Is Content : ' + name);
            this.loadContent(data[i]);
          }
        }
      }
    });
  }

  //Reset the values to default
  resetData(): void {
    this.currentFiles = 0;
    this.currentMaxFiles = 0;
    this.book = new BookObjModule();
    this.addedImages = false;
    this.added = false;
  }
  //#endregion Index content
  //Check if its an index file
  isAnIndexer(name: string): boolean {
    if (name.includes('nav.xhtml')) {
      return true;
    }
    return false;
  }
  isAnImg(name: string) {
    let toLowers = name.toLocaleLowerCase();
    if (toLowers.includes('.png')) {
      return true;
    }
    if (toLowers.includes('.jpg')) {
      return true;
    }
    return false;
  }
  loadFileName(obj: ZipEntry) {
    if (this.book.name != null) {
      console.log('Already has name');

      return;
    }
    let data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      let reader = new FileReader();
      reader.onload = () => {
        this.book.name = this.textControl.getTextBetween(
          reader.result.toString(),
          '<dc:title>',
          '</dc:title>'
        );
      };
      reader.readAsText(o);
    });
  }
  loadIndex(obj: ZipEntry) {
    let data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      let reader = new FileReader();
      reader.onload = () => {
        let formattedText: string = '';
        //Loaded a nav indexer
        if (obj.filename.includes('nav.xhtml')) {
          //Get name from original text
          this.book.name = this.textControl.getFileNameFromIndex(
            reader.result.toString(),
            navOptions
          );

          formattedText = this.textControl.replaceAllTextBetween(
            reader.result.toString(),
            navOptions
          );
        } else {
          console.log('No special Settings for ' + obj.filename);
          formattedText = reader.result.toString();
        }
        this.book.index = this.sanitizer.bypassSecurityTrustHtml(formattedText);
      };
      reader.readAsText(o);
    });
  }

  useContentAsMenu(): boolean {
    if (this.book == null) {
      return false;
    }
    return this.book.usePagesAsMenu;
  }
  //#endregion
  //#region  Images
  loadImg(obj: ZipEntry) {
    let data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      let reader = new FileReader();
      reader.onload = () => {
        let imgUrl = window.URL.createObjectURL(o);
        this.book.images.push({ name: obj.filename, url: imgUrl });
      };

      reader.readAsDataURL(o);
    });
  }

  //#endregion
  //#endregion Content
  loadContent(obj: ZipEntry) {
    let data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      let reader = new FileReader();
      reader.onload = () => {
        let content = reader.result.toString();
        //Look for the content title
        let theName = this.textControl.getTitleName(content);
        //If there is no title then set it to be the file name
        if (theName == null) {
          theName = this.textControl.getTextBetween(obj.filename, '/', '.');
        }

        let formattedText: string = this.textControl.cleanUpContent(
          reader.result.toString(),
          theName
        );

        let contentToAdd = new PageModule(
          theName,
          obj.filename,
          this.sanitizer.bypassSecurityTrustHtml(formattedText)
        );
        this.book.pages.push(contentToAdd);
        this.currentFiles++;
        if (this.currentFiles == this.currentMaxFiles) {
          this.book.Init();
          this.epubService.callOnOpenEpub(this.book);
          if (this.book.index == null) {
            this.book.usePagesAsMenu = true;
          }
        }
      };
      reader.readAsText(o);
    });
  }
  loadBook() {
    this.zip.getEntries(this.filePath).subscribe((data) => {
      console.log(data);
    });
  }
  //Skip to the given id
  skipTo(id: string) {
    let element = document.getElementById(`${id}`) as HTMLElement;
    if (element) {
      element.scrollIntoView({ behavior: 'auto', block: 'start' });
    } else {
      console.log("didn't find " + id);
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

  getIndexContent(): SafeHtml {
    if (this.book == null) {
      return '';
    }
    return this.book.index;
  }

  getContentClass(): string {
    return 'left';
  }
  //#endregion
}
