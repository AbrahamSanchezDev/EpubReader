import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { Inject } from '@angular/core';

export class FormateadParagraph {
  paragraph: HTMLParagraphElement;
  text: string[];
  constructor(para: HTMLParagraphElement) {
    this.paragraph = para;
    this.createText();
  }
  createText(): void {
    this.text = this.paragraph.textContent.split('. ');
  }
}
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
  formateadParagraphs: FormateadParagraph[] = [];
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
      } else {
        console.log('null parent');
      }
    }, 5);
  }

  isInFullView(element: HTMLElement): boolean {
    if (element == null) {
      console.log('Null Element');
      return false;
    }
    var position = element.getBoundingClientRect();
    // checking whether fully visible
    return position.top >= 0 && position.bottom <= window.innerHeight;
  }
  isView(element: HTMLElement): boolean {
    var position = element.getBoundingClientRect();
    // checking for partial visibility
    return position.top < window.innerHeight && position.bottom >= 0;
  }

  pageIsInView(): boolean {
    return this.isView(this.parent);
  }
  pageIsInFullView(): boolean {
    return this.isInFullView(this.parent);
  }
  focusOnParent(): void {
    if (this.pageIsInFullView() == false) {
      this.focusElement(this.parent);
    }
  }
  getParent(): HTMLElement {
    return this.parent;
  }
  protected focusElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  getFirstInView(): HTMLElement {
    for (let i = 0; i < this.paragraphs.length; i++) {
      if (this.isInFullView(this.paragraphs[i])) {
        return this.paragraphs[i];
      }
    }
    console.log('none is in full view');
    return null;
  }
  getFirstInViewIndex(): number {
    for (let i = 0; i < this.paragraphs.length; i++) {
      if (this.isInFullView(this.paragraphs[i])) {
        return i;
      }
    }
    return 0;
  }
  isValidIndex(index: number) {
    return index < this.paragraphs.length;
  }
  isParagraphInFullView(index: number): boolean {
    return this.isInFullView(this.paragraphs[index]);
  }
  getParagraphElement(index: number): HTMLElement {
    return this.paragraphs[index];
  }
  // getParagraphElement(index: number): HTMLElement {
  //   if (index >= this.paragraphs.length) {
  //     console.log('Out of index only up to ' + this.paragraphs.length);
  //     return;
  //   }
  //   if (this.isInFullView(this.paragraphs[index])) {
  //     return this.paragraphs[index];
  //   }
  //   return null;
  // }
  getTextFor(index: number): string {
    if (index >= this.paragraphs.length) {
      console.log('Out of index');

      return '';
    }
    return this.paragraphs[index].innerText;
  }
  getTotalParagraphs(): number {
    return this.paragraphs.length;
  }
}
