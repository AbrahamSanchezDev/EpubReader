import { Component, Input, ElementRef, ViewChild, inject, signal } from '@angular/core';
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
  // loading/progress state kept inside this component using signals for reactivity
  loading = signal(false);
  progressCurrent = signal(0);
  progressTotal = signal(0);
  progressPercent = signal(0);
  constructor() {
    this.epubService.onOpenEpub.subscribe((epub: BookObjModule) => {
      this.onOpenEpub(epub);
    });
    // subscribe to in-progress load events so component can show its own modal
    this.epubService.onLoadProgress.subscribe((p) => {
      this.loading.set(true);
      this.progressCurrent.set(p.current ?? 0);
      this.progressTotal.set(p.total ?? 0);
      if (this.progressTotal() > 0) {
        this.progressPercent.set(Math.round((this.progressCurrent() / this.progressTotal()) * 100));
      } else {
        this.progressPercent.set(0);
      }
      if (p.done || this.progressPercent() >= 99) {
        // small delay to let UI show 100%
        console.log('Loading complete, hiding progress after delay');
        setTimeout(() => {
          this.loading.set(false);
        }, 300);
      }
    });
  }

  //Call the add events on book loaded after delay
  onOpenEpub(epub: BookObjModule) {
     // reset image-added flag so images will be processed for the new book
    this.addedImages = false;

    // assign the loaded book so the template can render it
    this.book = epub;

    setTimeout(() => {
      this.addEvents();
    }, 5);
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
