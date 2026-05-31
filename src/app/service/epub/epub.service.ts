import { Injectable, EventEmitter } from '@angular/core';
import { BookObjModule } from '../../../app/model/epub/page/book-obj.module';

@Injectable({
  providedIn: 'root',
})
export class EpubService {
  public onOpenEpub: EventEmitter<BookObjModule> = new EventEmitter<BookObjModule>();
  // Emits loading progress: { current, total, done }
  public onLoadProgress: EventEmitter<{ current: number; total: number; done?: boolean }> =
    new EventEmitter<{ current: number; total: number; done?: boolean }>();
  public OnRead: EventEmitter<boolean> = new EventEmitter<boolean>();
  public OnReadNext: EventEmitter<boolean> = new EventEmitter<boolean>();
  public OnFileSelected: EventEmitter<File> = new EventEmitter<File>();
  public OnShowChapters: EventEmitter<boolean> = new EventEmitter<boolean>();
  public OnToggleChapters: EventEmitter<void> = new EventEmitter<void>();

  public onEpubReady: EventEmitter<BookObjModule> = new EventEmitter<BookObjModule>();

  private ids: string[] = [];

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
