import { Injectable, EventEmitter } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';

@Injectable({
  providedIn: 'root',
})
export class EpubService {
  public onOpenEpub: EventEmitter<BookObjModule> = new EventEmitter<
    BookObjModule
  >();

  private ids: string[] = [];

  constructor() {}

  callOnOpenEpub(epub: BookObjModule) {
    this.onOpenEpub.emit(epub);
  }
  clearIds(): void {
    this.ids = [];
  }
  addContentId(id: string): void {
    this.ids.push(id);
  }
  getIds(): string[] {
    return this.ids;
  }
}
