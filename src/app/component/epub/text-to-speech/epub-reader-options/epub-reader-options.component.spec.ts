import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubReaderOptionsComponent } from './epub-reader-options.component';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';

describe('EpubReaderOptionsComponent', () => {
  let component: EpubReaderOptionsComponent;
  let fixture: ComponentFixture<EpubReaderOptionsComponent>;

  let book: BookObjModule;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EpubReaderOptionsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubReaderOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    book = new BookObjModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call the events', () => {
    spyOn(component, 'onRead');
    component.epubService.OnRead.emit(true);
    component.epubService.onOpenEpub.emit(book);

    expect(component.onRead).toHaveBeenCalled();
    expect(component.hasBook).toBeTrue();
  });
  it('should set reading atm', () => {
    component.onRead(true);
    expect(component.readingAtm).toBeTrue();
    let reading = component.reading();
    expect(reading).toBeTrue();
  });
  it('should Toggle Read', () => {
    component.onRead(false);
    spyOn(component.epubService.OnRead, 'emit');
    component.toggleRead();
    expect(component.readingAtm).toBeTrue();
    expect(component.epubService.OnRead.emit).toHaveBeenCalled();
  });

  it('should call Next and previews', () => {
    spyOn(component.epubService.OnReadNext, 'emit');
    component.readNext();
    expect(component.epubService.OnReadNext.emit).toHaveBeenCalledWith(true);
    component.readPreviews();
    expect(component.epubService.OnReadNext.emit).toHaveBeenCalledWith(false);
  });
  it('should call showChapters', () => {
    spyOn(component.epubService, 'toggleChapters');
    component.showChapters();
    expect(component.epubService.toggleChapters).toHaveBeenCalled();
  });
  it('should return the correct text for reading atm', () => {
    component.onRead(false);
    let readingText = component.getReadText();
    expect(readingText).not.toContain('Stop');
    component.onRead(true);
    readingText = component.getReadText();
    expect(readingText).toContain('Stop');
  });
});
