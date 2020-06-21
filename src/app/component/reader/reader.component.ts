import {
  Component,
  OnInit,
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
      original: '</nav>',
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
  filePath = 'assets/TheDefeatedDragon.epub';

  myHtml: SafeHtml;
  added: boolean;
  curData;
  book: BookObjModule;
  currentFiles: number;
  currentMaxFiles: number;
  constructor(
    private zip: ZipService,
    private textControl: EpubTextFormatService,
    private sanitizer: DomSanitizer
  ) {}

  //Add the events to the menu index after the inner html is updated
  ngAfterViewChecked(): void {
    this.addEvents();
  }
  //Add the events to the menu index
  addEvents() {
    if (this.added && this.myHtml != null) return;
    let anchors = this.elementRef.nativeElement.querySelectorAll(
      'button'
    ) as HTMLButtonElement[];
    anchors.forEach((anchor: HTMLButtonElement) => {
      anchor.addEventListener(
        'click',
        (e) => {
          //call to skip to the same id as the element
          this.skipTo(anchor.id);
        },
        false
      );
      this.added = true;
    });
  }

  ngOnInit(): void {}

  fileChanged(event) {
    const file = event.target.files[0];
    this.resetData();
    this.book.name = file.name;
    this.zip.getEntries(file).subscribe((data: ZipEntry[]) => {
      this.currentMaxFiles = data.length;
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
        const name = data[i].filename;
        //img = .png
        if (name.includes('.png')) {
          this.loadImg(data[i]);
        }
        //htmls = ".xhtml"
        else if (name.includes('.xhtml')) {
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
        this.currentFiles++;
      }
    });
  }

  resetData(): void {
    this.currentFiles = 0;
    this.currentMaxFiles = 0;
    this.book = new BookObjModule();
  }
  //Check if its an index file
  isAnIndexer(name: string): boolean {
    if (name.includes('nav.xhtml')) {
      return true;
    }
    return false;
  }
  loadImg(obj: ZipEntry) {
    // console.log('Its the Img');
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
  loadContent(obj: ZipEntry) {
    let data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      let reader = new FileReader();
      reader.onload = () => {
        this.curData = reader.result;
        this.book.pages.push({
          name: obj.filename,
          fullName: obj.filename,
          content: reader.result.toString(),
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

  //Skip to the given id
  skipTo(id: string) {
    console.log('skip to -' + id);
  }
}
