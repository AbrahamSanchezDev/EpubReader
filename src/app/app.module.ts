import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReaderComponent } from './component/reader/reader.component';

import { HttpClientModule } from '@angular/common/http';
import { EpubDisplayComponent } from './component/epub/epub-display/epub-display.component';
import { EpubOptionsComponent } from './component/epub/epub-options/epub-options.component';
import { ToolsModule } from '@worldsdev/tools';
import { InUseMaterialModule } from './material-module';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { EpubReaderComponent } from './component/epub/text-to-speach/epub-reader/epub-reader.component';
import { EpubReaderOptionsComponent } from './component/epub/text-to-speach/epub-reader-options/epub-reader-options.component';
import { TextToSpeechOptionsComponent } from './component/epub/text-to-speach/text-to-speech-options/text-to-speech-options.component';
import { TextToSpeechService } from './service/text-to-speech/text-to-speech.service';
import { EpubSaveDataService } from './service/epub/epub-save-data.service';

@NgModule({
  declarations: [
    AppComponent,
    ReaderComponent,
    EpubDisplayComponent,
    EpubOptionsComponent,
    EpubReaderComponent,
    EpubReaderOptionsComponent,
    TextToSpeechOptionsComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ToolsModule,
    NoopAnimationsModule,
    InUseMaterialModule,
  ],
  providers: [TextToSpeechService, EpubSaveDataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
