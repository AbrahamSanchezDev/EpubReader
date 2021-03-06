import { Injectable } from '@angular/core';
import { ZipService } from '../zip/zip.service';
import { EpubTextFormatService } from './epub-text-format.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EpubService } from './epub.service';
import { ZipEntry } from '../zip/ZipEntry';
import { PageModule } from 'src/app/model/epub/page/page.module';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { TextReplaceData } from 'src/app/interface/text-replace-data';

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
  book: BookObjModule;
  currentFiles: number;
  currentMaxFiles: number;

  constructor(
    public zipService: ZipService,
    private textControl: EpubTextFormatService,
    private sanitizer: DomSanitizer,
    public epubService: EpubService
  ) {}

  //Called when adding a new file from selector
  loadEpub(file: File) {
    if (file == null) return;
    this.currentFiles = 0;
    this.currentMaxFiles = 0;
    this.book = new BookObjModule();
    var observable = this.zipService.getEntries(file);
    observable.subscribe((data: ZipEntry[]) => {
      //Load File Name
      this.lookForFileName(data);
      //Load Images
      this.loadImages(data);
      //Load Content
      this.getContentFromData(data);
    });
  }
  readZipEntryAsText(obj: ZipEntry, onLoad: Function) {
    const data = this.zipService.getData(obj);
    data.data.subscribe((o) => {
      const reader = new FileReader();
      reader.onload = () => {
        onLoad(reader.result.toString());
      };
      reader.readAsText(o);
    });
  }
  //#region File name
  lookForFileName(data: ZipEntry[]): void {
    for (let i = 0; i < data.length; i++) {
      const name = data[i].filename;
      if (name.includes('book.opf')) {
        this.loadFileName(data[i]);
        break;
      }
    }
  }
  loadFileName(obj: ZipEntry) {
    if (this.book.name != null) {
      console.log('Already has name');
      return;
    }
    this.readZipEntryAsText(obj, (content) => {
      this.setFileName(content);
    });
  }
  //Set the book name using the given result
  setFileName(result: string): void {
    this.book.name = this.textControl.getTextBetween(
      result,
      '<dc:title>',
      '</dc:title>'
    );
  }
  //#endregion

  //#region  Images
  //Load the images using the datas
  loadImages(datas: ZipEntry[]) {
    for (let i = 0; i < datas.length; i++) {
      this.loadImage(datas[i]);
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
    for (let i = 0; i < data.length; i++) {
      const name = data[i].filename;
      if (!name.includes('.xhtml')) continue;
      //If is not an indexer then is Content
      if (this.isAnIndexer(name) == false) {
        this.currentMaxFiles++;
        this.loadContent(data[i]);
      }
    }
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
      let formattedText: string = this.textControl.cleanUpContent(
        content,
        theName
      );
      let contentToAdd = new PageModule(
        theName,
        obj.filename,
        this.sanitizer.bypassSecurityTrustHtml(formattedText)
      );
      let curAmount = this.book.pages.length;
      contentToAdd.index = curAmount;
      this.book.pages.push(contentToAdd);
      this.checkIfFinishLoadingContent();
    });
  }
  //Check if it should finish loading content
  checkIfFinishLoadingContent(): void {
    this.currentFiles++;
    if (this.currentFiles == this.currentMaxFiles) {
      this.book.Init();
      this.book.usePagesAsMenu = this.book.index == null;
      this.epubService.callOnOpenEpub(this.book);
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
        formattedText = this.textControl.replaceAllTextBetween(
          content,
          navOptions
        );
      }
      this.book.index = this.sanitizer.bypassSecurityTrustHtml(formattedText);
    });
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
