import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewChecked,
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

  filePath = 'assets/TheDefeatedDragon.epub';

  addedImages: boolean = false;

  book: BookObjModule;
  currentFiles: number;
  currentMaxFiles: number;

  opened: boolean = false;

  constructor(
    private zip: ZipService,
    private textControl: EpubTextFormatService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private epubService: EpubService
  ) {
    epubService.OnFileSelected.subscribe((file) => {
      this.fileChanged(file);
    });
    epubService.OnToggleChapters.subscribe(() => {
      this.toggleIndex();
    });
    this.loadTestingFile();
  }

  //Add the events to the menu index after the inner html is updated
  ngAfterViewChecked(): void {}
  public ngAfterViewInit(): void {}

  ngOnInit(): void {}

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
          this.fileChanged(data);
        }
      });
  }
  onFileSelected(event) {
    this.fileChanged(event.target.files[0]);
  }

  //Called when adding a new file from selector
  fileChanged(file) {
    this.resetData();

    this.zip.getEntries(file).subscribe((data: ZipEntry[]) => {
      //Load File Name
      this.lookForFileName(data);
      //Load Images
      this.loadImages(data);
      //Load Content
      for (let i = 0; i < data.length; i++) {
        const name = data[i].filename;
        //htmls = ".xhtml"
        if (name.includes('.xhtml')) {
          //directory = nav.xhtml
          if (this.isAnIndexer(name)) {
            // this.loadIndex(data[i]);
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
  //#region File name
  lookForFileName(data: ZipEntry[]): void {
    for (let i = 0; i < data.length; i++) {
      const name = data[i].filename;
      if (name.includes('book.opf')) {
        this.loadFileName(data[i]);
        break;
      }
    }
  }
  loadFileName(obj: ZipEntry) {
    if (this.book.name != null) {
      console.log('Already has name');
      return;
    }
    this.readZipEntryAsText(obj, (content) => {
      this.setFileName(content);
    });
  }
  setFileName(result: string) {
    this.book.name = this.textControl.getTextBetween(
      result,
      '<dc:title>',
      '</dc:title>'
    );
  }
  //#endregion

  //#region  Images
  //Load the images using the datas
  loadImages(datas: ZipEntry[]) {
    for (let i = 0; i < datas.length; i++) {
      this.loadImage(datas[i]);
    }
  }
  //Load the given file
  loadImage(obj: ZipEntry) {
    if (!this.isImage(obj.filename)) {
      return;
    }
    this.readZipEntryAsText(obj, (content) => {});
    const data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      const reader = new FileReader();
      reader.onload = () => {
        const imgUrl = window.URL.createObjectURL(o);
        this.book.images.push({ name: obj.filename, url: imgUrl });
      };
      reader.readAsDataURL(o);
    });
  }
  //Check if the file has and image format
  isImage(name: string) {
    const toLowers = name.toLocaleLowerCase();
    if (toLowers.includes('.png')) {
      return true;
    }
    if (toLowers.includes('.jpg')) {
      return true;
    }
    return false;
  }
  //#endregion
  //#region Content
  //Load files with .xhtml in there full name
  getContentFromData(data: ZipEntry[]): void {
    for (let i = 0; i < data.length; i++) {
      const name = data[i].filename;
      if (name.includes('.xhtml')) {
        //If is not an indexer then is Content
        if (!this.isAnIndexer(name)) {
          this.currentMaxFiles++;
          this.loadContent(data[i]);
        }
      }
    }
  }
  //Check if its an index file
  isAnIndexer(name: string): boolean {
    if (name.includes('nav.xhtml')) {
      return true;
    }
    return false;
  }
  loadContent(obj: ZipEntry) {
    this.readZipEntryAsText(obj, (content) => {
      //Look for the content title
      let theName = this.textControl.getTitleName(content);
      //If there is no title then set it to be the file name
      if (theName == null) {
        theName = this.textControl.getTextBetween(obj.filename, '/', '.');
      }
      let formattedText: string = this.textControl.cleanUpContent(
        content,
        theName
      );
      let contentToAdd = new PageModule(
        theName,
        obj.filename,
        this.sanitizer.bypassSecurityTrustHtml(formattedText)
      );
      let curAmount = this.book.pages.length;
      contentToAdd.index = curAmount;
      this.book.pages.push(contentToAdd);
      this.checkIfFinishLoadingContent();
    });
  }
  checkIfFinishLoadingContent(): void {
    this.currentFiles++;
    if (this.currentFiles == this.currentMaxFiles) {
      this.book.Init();
      this.epubService.callOnOpenEpub(this.book);
      if (this.book.index == null) {
        this.book.usePagesAsMenu = true;
      }
      this.setupButtonsIds();
    }
  }

  //#endregion

  //Reset the values to default
  resetData(): void {
    this.currentFiles = 0;
    this.currentMaxFiles = 0;
    this.book = new BookObjModule();
    this.addedImages = false;
    this.epubService.clearIds();
    this.added = false;
  }
  //#endregion Index content

  loadIndex(obj: ZipEntry) {
    this.readZipEntryAsText(obj, (content) => {
      let formattedText: string = '';
      //Loaded a nav indexer
      if (obj.filename.includes('nav.xhtml')) {
        //Get name from original text
        this.book.name = this.textControl.getFileNameFromIndex(
          content,
          navOptions
        );
        formattedText = this.textControl.replaceAllTextBetween(
          content,
          navOptions
        );
      } else {
        console.log('No special Settings for ' + obj.filename);
        formattedText = content;
      }
      this.book.index = this.sanitizer.bypassSecurityTrustHtml(formattedText);
    });
  }

  useContentAsMenu(): boolean {
    if (this.book == null) {
      return false;
    }
    return this.book.usePagesAsMenu;
  }
  //#endregion

  readZipEntryAsText(obj: ZipEntry, onLoad: Function) {
    const data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      const reader = new FileReader();
      reader.onload = () => {
        onLoad(reader.result.toString());
      };
      reader.readAsText(o);
    });
  }
  //#endregion Content

  added = false;
  setupButtonsIds(): void {
    if (this.added) {
      return;
    }
    if (this.elementRef) {
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
