import { Component, OnInit, Renderer2 } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { EpubService } from 'src/app/service/epub/epub.service';

@Component({
  selector: 'app-epub-options',
  templateUrl: './epub-options.component.html',
  styleUrls: ['./epub-options.component.css'],
})
export class EpubOptionsComponent implements OnInit {
  book: BookObjModule;
  constructor(private epubService: EpubService, private render: Renderer2) {
    epubService.onOpenEpub.subscribe((epub) => {
      this.onOpenEpub(epub);
    });
  }
  ngOnInit(): void {}

  onOpenEpub(epub: BookObjModule) {
    setTimeout(() => {
      this.book = epub;
    }, 5);
  }

  hasBook(): boolean {
    return this.book != null;
  }

  selectedId: string;
  onTest(): void {
    const ids = this.epubService.getIds();
    if (ids.length == 0) {
      console.log('no pages');
      return;
    }
    this.selectedId = ids[0];
    this.checkIfInView(this.selectedId);
  }
  focusOn(): void {
    this.skipTo(this.selectedId);
  }
  //Skip to the given id
  skipTo(id: string) {
    if (id == null) {
      console.log('null id');
      return;
    }
    let element = document.getElementById(`${id}`) as HTMLElement;
    if (element) {
      this.skipToElement(element);
    }
  }
  skipToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'auto', block: 'start' });
  }
  checkIfInView(elementId: string): void {
    let parent = document.getElementById(elementId);
    if (parent == null) {
      console.log('null parent');
      return;
    }
    var position = parent.getBoundingClientRect();
    // checking whether fully visible
    if (position.top >= 0 && position.bottom <= window.innerHeight) {
      console.log('Element is fully visible in screen');
    }
    // checking for partial visibility
    else if (position.top < window.innerHeight && position.bottom >= 0) {
      console.log('Element is partially visible in screen');
    } else {
      console.log('Not in display');
    }
  }
  getFirstInView(): void {
    const pages = this.book.pages;
    for (let i = 0; i < pages.length; i++) {
      if (pages[i].pageIsInView()) {
        let obj = pages[i].getFirstInView();
        if (obj) {
          this.render.setAttribute(obj, 'class', 'selected');
          this.skipToElement(obj);
          setTimeout(() => {
            this.render.setAttribute(obj, 'class', '');
          }, 1000);
          console.log('Got obj');
        } else {
          console.log('nothing in full view');
        }

        return;
      }
    }
    console.log('No PAge  is in full view');
  }
  read: boolean = false;
  toggleRead(): void {
    this.read = !this.read;
    this.epubService.OnRead.emit(this.read);
  }
}
