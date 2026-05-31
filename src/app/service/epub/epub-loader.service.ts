import { Injectable, inject } from '@angular/core';
import { ZipService } from '../zip/zip.service';
import { EpubTextFormatService } from './epub-text-format.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EpubService } from './epub.service';
import { ZipEntry } from '../zip/ZipEntry';
import { PageModule } from '@models/epub/page/page.module';
import { BookObjModule } from '@models/epub/page/book-obj.module';
import { TextReplaceData } from '@interfaces/text-replace-data';

const navOptions: TextReplaceData = {
  beginString: 'href="',
  midString: 'xhtml#',
  replaceMidFor: '',
  removeFromTo: [
    //Remove the Nav
    { replaceFor: '<div class= "menu">', original: '<nav', originalEnd: '>' },
  ],
  replaceText: [
    {
      original: '</display:>',
      replaceFor: '</div>',
    },
    {
      //Replace the <a></a> link html to Button
      original: '<a ',
      replaceFor: '<button class ="index-obj" type="button" id ="',
    },
    {
      //Replace the <a></a> link html to Button
      original: '</a>',
      replaceFor: '</button>',
    },
  ],
  removeAllTags: ['ol', 'li'],
};
@Injectable({
  providedIn: 'root',
})
export class EpubLoaderService {
  book: BookObjModule = new BookObjModule();
  currentFiles = 0;
  currentMaxFiles = 0;
  private pendingContentLoads = 0;
  private pendingMetadataLoads = 0;
  private hasEmittedBook = false;

  public zipService = inject(ZipService);
  private textControl = inject(EpubTextFormatService);
  private sanitizer = inject(DomSanitizer);
  public epubService = inject(EpubService);

  //Called when adding a new file from selector
  loadEpub(file: File) {
    if (file == null) return;
    this.currentFiles = 0;
    this.currentMaxFiles = 0;
    this.pendingContentLoads = 0;
    this.pendingMetadataLoads = 0;
    this.hasEmittedBook = false;
    this.book = new BookObjModule();
    const observable = this.zipService.getEntries(file);
    observable.subscribe((data: ZipEntry[]) => {
      //Load file metadata and menu index first
      this.loadFileMetadata(data);
      //Load Images
      this.loadImages(data);
      //Load EPUB content pages
      this.getContentFromData(data);
    });
  }
  readZipEntryAsText(obj: ZipEntry, onLoad: (content: string) => void) {
    const data = this.zipService.getData(obj);
    data.data.subscribe((o) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        onLoad(result != null ? result.toString() : '');
      };
      reader.readAsText(o);
    });
  }
  //#region File name
  loadFileMetadata(data: ZipEntry[]): void {
    let foundOpf = false;
    let foundNav = false;
    for (const entry of data) {
      const name = entry.filename;
      if (!foundOpf && name.includes('book.opf')) {
        foundOpf = true;
        this.pendingMetadataLoads++;
        this.loadFileName(entry);
      }
      if (!foundNav && this.isAnIndexer(name)) {
        foundNav = true;
        this.pendingMetadataLoads++;
        this.loadIndex(entry);
      }
      if (foundOpf && foundNav) {
        break;
      }
    }
  }
  loadFileName(obj: ZipEntry) {
    if (this.book.name != null) {
      console.log('Already has name');
      this.pendingMetadataLoads = Math.max(0, this.pendingMetadataLoads - 1);
      this.emitBookReady();
      return;
    }
    this.readZipEntryAsText(obj, (content) => {
      this.setFileName(content);
      this.pendingMetadataLoads = Math.max(0, this.pendingMetadataLoads - 1);
      this.emitBookReady();
    });
  }
  //Set the book name using the given result
  setFileName(result: string): void {
    this.book.name = this.textControl.getTextBetween(result, '<dc:title>', '</dc:title>');
  }
  //#endregion

  //#region  Images
  //Load the images using the datas
  loadImages(datas: ZipEntry[]) {
    for (const data of datas) {
      this.loadImage(data);
    }
  }
  //Load the given file
  loadImage(obj: ZipEntry) {
    if (!this.isImage(obj.filename)) {
      return;
    }
    const data = this.zipService.getData(obj);
    data.data.subscribe((o) => {
      const reader = new FileReader();
      reader.onload = () => {
        const imgUrl = window.URL.createObjectURL(o);
        this.book.images.push({ name: obj.filename, url: imgUrl });
      };
      reader.readAsDataURL(o);
    });
  }
  //Check if the file has and image format
  isImage(name: string) {
    const toLowers = name.toLocaleLowerCase();
    if (toLowers.includes('.png') || toLowers.includes('.jpg')) {
      return true;
    }
    return false;
  }
  //#endregion

  //#region Content
  //Load files with .xhtml in there full name
  getContentFromData(data: ZipEntry[]): void {
    for (const entry of data) {
      const name = entry.filename;
      if (!name.includes('.xhtml')) continue;
      if (this.isAnIndexer(name)) {
        continue;
      }
      this.currentMaxFiles++;
      this.pendingContentLoads++;
      this.loadContent(entry);
    }
    this.emitBookReady();
  }
  //Check if its an index file
  isAnIndexer(name: string): boolean {
    if (name.includes('nav.xhtml')) {
      return true;
    }
    return false;
  }

  loadContent(obj: ZipEntry) {
    this.readZipEntryAsText(obj, (content) => {
      //Look for the content title
      let theName = this.textControl.getTitleName(content);
      //If there is no title then set it to be the file name
      if (theName == null || theName == '') {
        theName = this.textControl.getTextBetween(obj.filename, '/', '.');
      }
      const formattedText: string = this.textControl.cleanUpContent(content, theName);
      const contentToAdd = new PageModule(
        theName,
        obj.filename,
        this.sanitizer.bypassSecurityTrustHtml(formattedText),
      );
      const curAmount = this.book.pages.length;
      contentToAdd.index = curAmount;
      this.book.pages.push(contentToAdd);
      this.pendingContentLoads = Math.max(0, this.pendingContentLoads - 1);
      this.checkIfFinishLoadingContent();
      this.emitBookReady();
    });
  }
  //Check if it should finish loading content
  checkIfFinishLoadingContent(): void {
    this.currentFiles++;
    // emit progress after incrementing
    try {
      this.epubService.onLoadProgress.emit({
        current: this.currentFiles,
        total: this.currentMaxFiles,
        done: this.currentFiles === this.currentMaxFiles,
      });
    } catch (e) {
      console.error('Failed to emit load progress', e);
    }
    if (this.currentFiles === this.currentMaxFiles) {
      this.emitBookReady();
    }
  }
  //#endregion

  //#region LoadIndex
  loadIndex(obj: ZipEntry) {
    this.readZipEntryAsText(obj, (content) => {
      let formattedText: string = content;
      //Loaded a nav indexer
      if (obj.filename.includes('nav.xhtml')) {
        //Get name from original text
        this.book.name = this.textControl.getFileNameFromIndex(content);
        formattedText = this.textControl.replaceAllTextBetween(content, navOptions);
      }
      this.book.index = this.sanitizer.bypassSecurityTrustHtml(formattedText);
      this.pendingMetadataLoads = Math.max(0, this.pendingMetadataLoads - 1);
      this.emitBookReady();
    });
    console.log('Finished loadIndex for', obj.filename);
  }

  private emitBookReady(): void {
    if (this.hasEmittedBook) {
      return;
    }
    if (this.pendingContentLoads > 0 || this.pendingMetadataLoads > 0) {
      return;
    }
    if (this.currentFiles !== this.currentMaxFiles) {
      return;
    }
    this.book.Init();
    this.book.usePagesAsMenu = this.book.index == null || this.book.index === '';
    console.log(this.book.index);
    this.hasEmittedBook = true;
    this.epubService.callOnOpenEpub(this.book);
    if(this.book.name == null || this.book.name.trim() === '') {
      this.useFileNameAsTitle();
    }
    setTimeout(() => {
      // open the menu once a book is loaded so controls are visible
      console.log('..........EpubOptionsComponent received book:', this.book);
      this.epubService.onEpubReady.emit(this.book);
    }, 5);
  }

  useFileNameAsTitle() : void{
    this.book.name = this.zipService.lastFileName.replace('.epub', '');
  }

  //Returns if should use the content as menu
  useContentAsMenu(): boolean {
    if (this.book == null) {
      return false;
    }
    return this.book.usePagesAsMenu;
  }
  //#endregion
}
