import { Injectable, EventEmitter } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';

@Injectable({
  providedIn: 'root',
})
export class EpubService {
  public onOpenEpub: EventEmitter<BookObjModule> = new EventEmitter<
    BookObjModule
  >();

  constructor() {}

  callOnOpenEpub(epub: BookObjModule) {
    this.onOpenEpub.emit(epub);
  }
}
