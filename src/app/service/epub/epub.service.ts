import { Injectable, EventEmitter } from '@angular/core';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';

@Injectable({
  providedIn: 'root',
})
export class EpubService {
  public onOpenEpub: EventEmitter<BookObjModule> = new EventEmitter<
    BookObjModule
  >();
  public OnRead: EventEmitter<boolean> = new EventEmitter<boolean>();
  public OnReadNext: EventEmitter<boolean> = new EventEmitter<boolean>();
  public OnFileSelected: EventEmitter<File> = new EventEmitter<File>();
  public OnShowChapters: EventEmitter<boolean> = new EventEmitter<boolean>();
  public OnToggleChapters: EventEmitter<void> = new EventEmitter<void>();

  private ids: string[] = [];

  constructor() {}
  //Call the on open
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
  toggleChapters(): void {
    this.OnToggleChapters.emit();
  }
}
