import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { Inject } from '@angular/core';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class PageModule {
  name: string;
  fullName: string;
  content: SafeHtml;
  index: number;

  private parent: HTMLElement;
  private paragraphs: NodeListOf<HTMLParagraphElement>;
  private spans: NodeListOf<HTMLSpanElement>;

  constructor(
    @Inject(String) name: string,
    @Inject(String) fullName: string,
    @Inject(String) content: SafeHtml
  ) {
    this.name = name;
    this.fullName = fullName;
    this.content = content;
  }
  getContentData(): void {
    if (this.paragraphs) {
      return;
    }
    setTimeout(() => {
      this.parent = document.getElementById(this.name);
      if (this.parent) {
        this.paragraphs = this.parent.querySelectorAll('p');
        this.spans = this.parent.querySelectorAll('span');
      } else {
        console.log('null parent');
      }
    }, 5);
  }
  checkIfInView(index: number): void {
    if (this.paragraphs == null) {
      console.log('null paragraphs');

      return;
    }
    if (index >= this.paragraphs.length) {
      console.log(
        'Out of index paragraphs only goes up to ' + this.paragraphs.length
      );

      return;
    }
    var position = this.paragraphs[index].getBoundingClientRect();
    // checking whether fully visible
    if (position.top >= 0 && position.bottom <= window.innerHeight) {
      console.log('Element is fully visible in screen');
    }

    // checking for partial visibility
    if (position.top < window.innerHeight && position.bottom >= 0) {
      console.log('Element is partially visible in screen');
    }
  }
  isInFullView(element: HTMLElement): boolean {
    var position = element.getBoundingClientRect();
    // checking whether fully visible
    if (position.top >= 0 && position.bottom <= window.innerHeight) {
      console.log('Element is fully visible in screen');
      return true;
    }
    return false;
  }
  isView(element: HTMLElement): boolean {
    var position = element.getBoundingClientRect();
    // checking whether fully visible
    // checking for partial visibility
    if (position.top < window.innerHeight && position.bottom >= 0) {
      console.log('Element is partially visible in screen');
      return true;
    }
    return false;
  }

  pageIsInView(): boolean {
    if (this.isView(this.parent)) {
      return true;
    }
    return false;
  }
  getFirstInView(): HTMLElement {
    // if (this.spans) {
    //   for (let i = 0; i < this.spans.length; i++) {
    //     if (this.isInFullView(this.spans[i])) {
    //       return this.spans[i];
    //     }
    //   }
    // }
    for (let i = 0; i < this.paragraphs.length; i++) {
      if (this.isInFullView(this.paragraphs[i])) {
        return this.paragraphs[i];
      }
    }
    console.log('none is in full view');

    return null;
  }
  getInView(index: number): HTMLElement {
    if (index >= this.paragraphs.length) {
      console.log('Out of index only up to ' + this.paragraphs.length);
      return;
    }
    if (this.isInFullView(this.paragraphs[index])) {
      return this.paragraphs[index];
    }
    return null;
  }
}
