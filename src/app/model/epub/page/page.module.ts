import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';

@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class PageModule {
  name: string;
  fullName: string;
  content: SafeHtml;
}
