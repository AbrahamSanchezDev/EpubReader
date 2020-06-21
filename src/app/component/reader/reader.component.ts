import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  AfterContentChecked,
  AfterViewInit,
} from '@angular/core';
import { ZipService } from 'src/app/service/zip/zip.service';
import { ZipEntry } from 'src/app/service/zip/ZipEntry';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { TextControlService } from 'src/app/service/data/text-control.service';
import { SafeHtml } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { TextReplaceData } from 'src/app/interface/text-replace-data';

const navOptions: TextReplaceData = {
  beginString: 'href=',
  midString: 'h.',
  replaceMidFor: ' ',
  removeFromTo: [
    //Remove the Nav
    { replaceFor: '<div class= "menu" >', original: '<nav', originalEnd: '>' },
  ],
  replaceText: [
    {
      original: '</nav>',
      replaceFor: '</div>',
    },
  ],
  removeAllTags: ['li', 'ol'],
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

  constructor(
    private zip: ZipService,
    private textControl: TextControlService,
    private sanitizer: DomSanitizer
  ) {}

  //Add the events to the menu index after the inner html is updated
  ngAfterViewChecked(): void {
    this.addEvents();
  }
  //Add the events to the menu index
  addEvents() {
    if (this.added) return;
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
    this.book = new BookObjModule();
    this.book.name = file.name;
    this.zip.getEntries(file).subscribe((data: ZipEntry[]) => {
      // console.log(data);
      for (let i = 0; i < data.length; i++) {
        //img = .png
        //htmls = ".xhtml"
        //directory = nav.xhtml
        const name = data[i].filename;
        if (name.includes('.png')) {
          this.loadImg(data[i]);
        } else if (name.includes('.xhtml')) {
          if (name.includes('nav.xhtml')) {
            this.loadIndex(data[i]);
          } else {
            this.loadContent(data[i]);
          }
        }
      }
    });
  }
  loadImg(obj: ZipEntry) {
    // console.log('Its the Img');
  }
  loadIndex(obj: ZipEntry) {
    let data = this.zip.getData(obj);
    data.data.subscribe((o) => {
      let reader = new FileReader();
      reader.onload = () => {
        this.myHtml = this.sanitizer.bypassSecurityTrustHtml(
          this.textControl.replaceAllTextBetween(
            reader.result.toString(),
            navOptions
          )
        );
        this.book.index = this.myHtml;
        this.formatIndex();
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

  formatIndex() {}
  skipTo(id: string) {
    console.log('skip to -' + id);
  }
}
