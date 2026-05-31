import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';
import { Inject } from '@angular/core';

export class FormateadParagraph {
  element: HTMLElement;
  text: string[] = [];
  index = 0;
  finished = false;

  originalText = '';
  constructor(para: HTMLElement) {
    this.element = para;
  }
  createText(text: string): void {
    this.originalText = text;
    this.text = text.split('. ');
    if (this.text.length == 0) {
      this.finished = true;
    }
  }
  getTextToRead(): string {
    return this.text[this.index];
  }
  resetValues(): void {
    this.index = 0;
    this.finished = this.text.length == 0;
  }
  onFinishRead(): void {
    if (this.finished) {
      return;
    }
    this.index++;
    if (this.index >= this.text.length) {
      this.finished = true;
    }
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
  index = 0;

  private parent: HTMLElement | null = null;
  // private paragraphs: HTMLElement[];
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
    if (this.formateadParagraphs && this.formateadParagraphs.length > 0) {
      return;
    }
    this.formateadParagraphs = [];
    setTimeout(() => {
      this.parent = document.getElementById(this.name);
      if (this.parent) {
        const all = this.parent.querySelectorAll('.text-obj');

        // let strong = this.parent.querySelectorAll('strong');
        // const text = this.parent.innerText;
        // const letters = /((^[0-9]+[a-z]+)|(^[a-z]+[0-9]+))+[0-9a-z]+$/;
        // const textsLetter = /^[a-z0-9]+$/i;
        const lettersText = /[a-z]/i;
        for (const element of all) {
          if (
            !element.textContent.match(lettersText) ||
            element.textContent == '' ||
            element.textContent == '&nbsp;' ||
            element.textContent === ' '
          ) {
            continue;
          }

          const elementToAdd = new FormateadParagraph(element as HTMLElement);
          elementToAdd.createText(element.textContent);
          this.formateadParagraphs.push(elementToAdd);
        }
        // console.log(this.formateadParagraphs);
      } else {
        console.log('null parent');
      }
    }, 5);
  }

  isInFullView(element: HTMLElement | null): boolean {
    if (!element) {
      return false;
    }
    const position = element.getBoundingClientRect();
    // checking whether fully visible
    return position.top >= 0 && position.bottom <= window.innerHeight;
  }
  isView(element: HTMLElement | null): boolean {
    if (!element) {
      return false;
    }
    const position = element.getBoundingClientRect();
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
    if (this.pageIsInFullView() == false && this.parent) {
      this.focusElement(this.parent);
    }
  }
  getParent(): HTMLElement | null {
    return this.parent;
  }
  protected focusElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  getFirstInView(): HTMLElement | null {
    for (const paragraph of this.formateadParagraphs) {
      if (this.isInFullView(paragraph.element)) {
        return paragraph.element;
      }
    }
    console.log('none is in full view');
    return null;
  }
  getFirstInViewIndex(): number {
    for (const [index, paragraph] of this.formateadParagraphs.entries()) {
      if (this.isInFullView(paragraph.element)) {
        return index;
      }
    }
    return 0;
  }
  isValidIndex(index: number) {
    return index < this.formateadParagraphs.length;
  }
  isParagraphInFullView(index: number): boolean {
    if (index >= this.formateadParagraphs.length) {
      return false;
    }
    return this.isInFullView(this.formateadParagraphs[index].element);
  }
  getParagraphElement(index: number): HTMLElement {
    if (index >= this.formateadParagraphs.length) {
      throw new Error('Index out of bounds');
    }
    return this.formateadParagraphs[index].element;
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

  getTotalParagraphs(): number {
    return this.formateadParagraphs.length;
  }
  getTextFor(index: number): FormateadParagraph | null {
    if (index >= this.formateadParagraphs.length) {
      return null;
    }
    return this.formateadParagraphs[index];
  }
}
