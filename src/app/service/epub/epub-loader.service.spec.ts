import { TestBed } from '@angular/core/testing';

import { EpubLoaderService } from './epub-loader.service';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';

fdescribe('EpubLoaderService', () => {
  let service: EpubLoaderService;

  let book: BookObjModule;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubLoaderService);

    book = new BookObjModule();
    service.book = book;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set file name', () => {
    let result = '<dc:title>My title</dc:title>';
    service.setFileName(result);
    expect(service.book.name).toBe('My title');
  });

  it('should check if the given text is an image', () => {
    let indexer = service.isImage('someText.xhtml');
    expect(indexer).toBe(false);
    indexer = service.isImage('img.png');
    expect(indexer).toBe(true);
    indexer = service.isImage('img.jpg');
    expect(indexer).toBe(true);
  });
  it('should check if the given text is an indexer', () => {
    let indexer = service.isAnIndexer('someText.xhtml');
    expect(indexer).toBe(false);
    indexer = service.isAnIndexer('nav.xhtml');
    expect(indexer).toBe(true);
  });

  it('should check if should finish reading', () => {
    spyOn(service.epubService, 'callOnOpenEpub');
    //Not finish
    service.currentMaxFiles = 2;
    service.currentFiles = 0;
    service.checkIfFinishLoadingContent();
    expect(service.epubService.callOnOpenEpub).not.toHaveBeenCalled();
    //Finish and should use content as index
    service.currentMaxFiles = 1;
    service.currentFiles = 0;
    service.book.index = null;
    service.checkIfFinishLoadingContent();
    expect(service.epubService.callOnOpenEpub).toHaveBeenCalled();
    expect(service.book.usePagesAsMenu).toBe(true);
    //Finish and should not use content as index
    service.book.usePagesAsMenu = false;
    service.book.index = 'Some Index';
    service.checkIfFinishLoadingContent();
    expect(service.epubService.callOnOpenEpub).toHaveBeenCalled();
    expect(service.book.usePagesAsMenu).toBe(false);
  });

  it('should return if should use content as menu', () => {
    service.book = null;
    let use = service.useContentAsMenu();
    expect(use).toBe(false);

    book.usePagesAsMenu = true;
    service.book = book;
    use = service.useContentAsMenu();
    expect(use).toBe(true);
  });
});
