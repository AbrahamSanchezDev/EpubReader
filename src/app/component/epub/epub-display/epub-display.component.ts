import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { EpubService } from 'src/app/service/epub/epub.service';

@Component({
  selector: 'app-epub-display',
  templateUrl: './epub-display.component.html',
  styleUrls: ['./epub-display.component.css'],
})
export class EpubDisplayComponent implements OnInit {
  @Input() book: BookObjModule;
  @ViewChild('content') content: ElementRef;

  addedImages: boolean = false;
  notFoundImg: string =
    'https://c.wallhere.com/photos/b0/78/nozomu_itoshiki_Sayonara_Zetsubou_Sensei_Kafuka_Fuura_anime-231302.jpg!d';

  constructor(public epubService: EpubService) {
    epubService.onOpenEpub.subscribe((epub: BookObjModule) => {
      this.onOpenEpub(epub);
    });
  }

  ngOnInit(): void {}
  //Call the add events on book loaded after delay
  onOpenEpub(epub: BookObjModule) {
    setTimeout(() => {
      this.addEvents();
    }, 5);
  }
  //Should add images
  addEvents(): void {
    if (this.addedImages == false) {
      let images = this.content.nativeElement.querySelectorAll('img');

      images.forEach((img) => {
        img.src = this.getImg(img.id);
        this.addedImages = true;
      });
    }
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
  //Get the name of the book
  getBookName(): string {
    return this.book ? (this.book.name ? this.book.name : '') : '';
  }
  //Get content from the book
  getContent(): PageModule[] {
    if (this.book == null) {
      return null;
    }
    return this.book.pages;
  }
}
