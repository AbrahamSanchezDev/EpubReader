import { Component, Input, ElementRef, ViewChild, inject } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { EpubService } from 'src/app/service/epub/epub.service';

@Component({
  selector: 'app-epub-display',
  standalone: true,
  imports: [],
  templateUrl: './epub-display.component.html',
  styleUrls: ['./epub-display.component.css'],
})
export class EpubDisplayComponent {
  @Input() book: BookObjModule | null = null;
  @ViewChild('content') content: ElementRef = new ElementRef(null);

  addedImages = false;
  notFoundImg =
    'https://c.wallhere.com/photos/b0/78/nozomu_itoshiki_Sayonara_Zetsubou_Sensei_Kafuka_Fuura_anime-231302.jpg!d';

  public epubService = inject(EpubService);
  constructor() {
    this.epubService.onOpenEpub.subscribe((epub: BookObjModule) => {
      this.onOpenEpub(epub);
    });
  }

  //Call the add events on book loaded after delay
  onOpenEpub(epub: BookObjModule) {
    setTimeout(() => {
      this.addEvents();
    }, 5);
    console.log(epub);
  }
  //Should add images
  addEvents(): void {
    if (this.addedImages == false) {
      const images = this.content.nativeElement.querySelectorAll('img');

      images.forEach((img: HTMLImageElement) => {
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
      for (const images of this.book.images) {
        if (images.name.includes(id)) {
          return images.url;
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
      return [];
    }
    return this.book.pages;
  }
}
