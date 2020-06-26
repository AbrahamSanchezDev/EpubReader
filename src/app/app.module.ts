import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReaderComponent } from './component/reader/reader.component';

import { HttpClientModule } from '@angular/common/http';
import { EpubDisplayComponent } from './component/epub/epub-display/epub-display.component';
import { EpubOptionsComponent } from './component/epub/epub-options/epub-options.component';

@NgModule({
  declarations: [AppComponent, ReaderComponent, EpubDisplayComponent, EpubOptionsComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
