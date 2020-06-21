import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageModule } from './page.module';
import { SafeHtml } from '@angular/platform-browser';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class BookObjModule {
  name: string;
  pages: PageModule[];
  index: SafeHtml;
  constructor() {
    this.pages = [];
  }
}
