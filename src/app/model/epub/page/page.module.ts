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

  private paragraphs: NodeListOf<HTMLParagraphElement>;

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
      let parent = document.getElementById(this.name);
      if (parent) {
        this.paragraphs = parent.querySelectorAll('p');
      } else {
        console.log('no match for ' + this.name);
      }
    }, 5);
  }
}
