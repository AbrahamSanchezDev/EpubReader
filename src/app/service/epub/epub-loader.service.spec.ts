import { TestBed, async } from '@angular/core/testing';

import { EpubLoaderService } from './epub-loader.service';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { ZipService } from '../zip/zip.service';
import { ZipEntry } from '../zip/ZipEntry';
import { ZipTask } from '../zip/ZipTask';
import { Observable } from 'rxjs';
import { ZipTaskProgress } from '../zip/ZipTaskProgress';

fdescribe('EpubLoaderService', () => {
  let service: EpubLoaderService;

  let book: BookObjModule;
  const zipEntryTest: ZipEntry = {
    version: 10,
    bitFlag: 10,
    compressionMethod: 10,
    lastModDateRaw: 10,
    lastModDate: 'string',
    crc32: 10,
    compressedSize: 10,
    uncompressedSize: 10,
    filenameLength: 10,
    extraFieldLength: 10,
    commentLength: 10,
    directory: true,
    offset: 0,
    filename: 'string',
    comment: 'string',
  };
  let entryTests: ZipEntry[];
  const progressOb: Observable<ZipTaskProgress> = new Observable<
    ZipTaskProgress
  >((subscriber) => {
    const progress: ZipTaskProgress = {
      active: true,
    };
    subscriber.next(progress);
    subscriber.complete();
  });
  const dataBlob: Observable<Blob> = new Observable<Blob>((subscriber) => {
    subscriber.next(new Blob());
    subscriber.complete();
  });
  const zipTaskData: ZipTask = { progress: progressOb, data: dataBlob };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ZipService],
    });
    service = TestBed.inject(EpubLoaderService);
    book = new BookObjModule();
    service.book = book;
    entryTests = [zipEntryTest];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should not load epub file', () => {
    service.book = null;
    service.loadEpub(null);
    expect(service.book).toBe(null);
  });
  it('should load epub file', () => {
    var file = new File([''], 'test-file.jpg', { type: 'image/jpeg' });
    var zipEntry: ZipEntry[] = [];
    var observable = new Observable<Array<ZipEntry>>((subscriber) => {
      subscriber.next(zipEntry);
      subscriber.complete();
    });
    spyOn(service.zip, 'getEntries').and.returnValue(observable);
    service.loadEpub(file);
    expect(service.zip.getEntries).toHaveBeenCalled();
  });

  it('should read Zip as text', async(() => {
    spyOn(service.zip, 'getData').and.returnValue(zipTaskData);
    spyOn(service, 'isImage');
    service.readZipEntryAsText(zipEntryTest, (result) => {
      expect(result).not.toBeNull();
      service.isImage(result);
    });
    setTimeout(() => {
      expect(service.isImage).toHaveBeenCalled();
    });
  }));

  it('should load file name', () => {
    spyOn(service, 'readZipEntryAsText');
    service.book.name = 'Some title';
    service.loadFileName(zipEntryTest);
    expect(service.readZipEntryAsText).not.toHaveBeenCalled();
    service.book.name = null;
    service.loadFileName(zipEntryTest);
    expect(service.readZipEntryAsText).toHaveBeenCalled();
  });

  it('should look for file name', () => {
    spyOn(service, 'loadFileName');
    service.lookForFileName(entryTests);
    expect(service.loadFileName).not.toHaveBeenCalled();
    var zipEntry: ZipEntry = zipEntryTest;
    zipEntry.filename = 'book.opf';
    entryTests.push(zipEntry);
    service.lookForFileName(entryTests);
    expect(service.loadFileName).toHaveBeenCalled();
  });

  it('should not load epub file', () => {
    service.book = null;
    service.loadEpub(null);
    expect(service.book).toBe(null);
  });

  it('should set file name', () => {
    let result = '<dc:title>My title</dc:title>';
    service.setFileName(result);
    expect(service.book.name).toBe('My title');
  });

  it('should load Images', () => {
    spyOn(service, 'loadImage');
    service.loadImages(entryTests);
    expect(service.loadImage).toHaveBeenCalledTimes(entryTests.length);
  });
  it('should load Image', () => {
    spyOn(service.zip, 'getData').and.returnValue(zipTaskData);
    service.loadImages(entryTests);
    expect(service.zip.getData).not.toHaveBeenCalled();
    var data = zipEntryTest;
    data.filename = 'image.png';
    entryTests.push(data);
    service.loadImages(entryTests);
    expect(service.zip.getData).toHaveBeenCalled();
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
