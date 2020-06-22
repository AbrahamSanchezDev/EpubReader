import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageModule } from './page.module';
import { SafeHtml } from '@angular/platform-browser';
import { ImgUrlData } from 'src/app/interface/img-url-data';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class BookObjModule {
  name: string;
  pages: PageModule[];
  index: SafeHtml;
  images: ImgUrlData[];
  constructor() {
    this.pages = [];
    this.images = [];
  }
}
