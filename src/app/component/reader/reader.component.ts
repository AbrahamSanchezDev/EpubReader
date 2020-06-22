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
  @ViewChild('content') content: ElementRef;
  @ViewChild('content', { read: ViewContainerRef })
  filePath = 'assets/TheDefeatedDragon.epub';

  myHtml: SafeHtml;
  added: boolean;
  addedImages: boolean = false;
  book: BookObjModule;
  currentFiles: number;
  currentMaxFiles: number;
  notFoundImg: string =
    'https://c.wallhere.com/photos/b0/78/nozomu_itoshiki_Sayonara_Zetsubou_Sensei_Kafuka_Fuura_anime-231302.jpg!d';
  constructor(
    private zip: ZipService,
    private textControl: EpubTextFormatService,
    private sanitizer: DomSanitizer,
    private http: HttpClient
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
    if (this.addedImages == false) {
      let images = this.content.nativeElement.querySelectorAll('img');

      images.forEach((img) => {
        img.src = this.getImg(img.id);
        this.addedImages = true;
        // img.style = '';
      });
    }
    if (this.added) return;
    let buttons = this.elementRef.nativeElement.querySelectorAll(
      'button'
    ) as HTMLButtonElement[];
    buttons.forEach((anchor: HTMLButtonElement) => {
      let id = anchor.id;
      anchor.addEventListener(
        'click',
        (e) => {
          //call to skip to the same id as the element
          this.skipTo(id);
        },
        false
      );
      anchor.id = '';
      this.added = true;
    });
  }

  ngOnInit(): void {}

  loadTestingFile() {
    let filePath = 'assets/epub/';
    let dragons = 'The Defeated Dragon 1 - 100.epub';
    let fileName = dragons;
    this.http
      .get(filePath + fileName, { responseType: 'blob' })
      .subscribe((data) => {
        console.log(data);
        this.fileChanged(data);
      });
  }
  onFileSelected(event) {
    console.log(event);

    this.fileChanged(event.target.files[0]);
  }
  //Called when adding a new file from selector
  fileChanged(file) {
    this.resetData();
    this.book.name = file.name;

    this.zip.getEntries(file).subscribe((data: ZipEntry[]) => {
      this.currentMaxFiles = data.length;
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
        const name = data[i].filename;
        //img = .png
        if (this.isAnImg(name)) {
          this.loadImg(data[i]);
        }
        this.currentFiles++;
      }
      for (let i = 0; i < data.length; i++) {
        const name = data[i].filename;
        //htmls = ".xhtml"
        if (name.includes('.xhtml')) {
          //directory = nav.xhtml
          if (this.isAnIndexer(name)) {
            console.log('Is Index : ' + name);
            this.loadIndex(data[i]);
          }
          //Content
          else {
            // console.log('Is Content : ' + name);
            this.loadContent(data[i]);
          }
        }
      }
      if (this.book.index == null) {
        console.log('no Index');
      }
    });
  }
  loadAndZip(file) {}
  //Reset the values to default
  resetData(): void {
    this.currentFiles = 0;
    this.currentMaxFiles = 0;
    this.book = new BookObjModule();
    this.addedImages = false;
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
  loadIndex(obj: ZipEntry) {
    console.warn('Loading ' + obj.filename);

    let data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      let reader = new FileReader();
      reader.onload = () => {
        let formattedText: string = '';
        //Loaded a nav indexer
        if (obj.filename.includes('nav.xhtml')) {
          formattedText = this.textControl.replaceAllTextBetween(
            reader.result.toString(),
            navOptions
          );
        } else {
          console.log('No special Settings for ' + obj.filename);
          formattedText = reader.result.toString();
        }
        this.myHtml = this.sanitizer.bypassSecurityTrustHtml(formattedText);
        this.book.index = this.myHtml;
      };
      reader.readAsText(o);
    });
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
  //Returns the img url that was created for the book
  getImg(id: string): string {
    if (id.includes('http')) {
      return id;
    }
    if (this.book) {
      for (let i = 0; i < this.book.images.length; i++) {
        if (this.book.images[i].name.includes(id)) {
          return this.book.images[i].url;
        }
      }
    }
    return this.notFoundImg;
  }
  //#endregion
  //#endregion Content
  loadContent(obj: ZipEntry) {
    let data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      let reader = new FileReader();
      reader.onload = () => {
        let formattedText: string = this.textControl.cleanUpContent(
          reader.result.toString()
        );

        this.book.pages.push({
          name: obj.filename,
          fullName: obj.filename,
          content: this.sanitizer.bypassSecurityTrustHtml(formattedText),
        });
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
    return this.myHtml;
  }
  //#endregion
}
