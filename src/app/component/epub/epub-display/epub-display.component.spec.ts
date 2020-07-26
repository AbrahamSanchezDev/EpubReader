import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubDisplayComponent } from './epub-display.component';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { PageModule } from 'src/app/model/epub/page/page.module';

describe('EpubDisplayComponent', () => {
  let component: EpubDisplayComponent;
  let fixture: ComponentFixture<EpubDisplayComponent>;
  let book: BookObjModule;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EpubDisplayComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    book = new BookObjModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should call on open epub', () => {
    spyOn(component, 'onOpenEpub');
    component.epubService.onOpenEpub.emit(book);
    expect(component.onOpenEpub).toHaveBeenCalled();
  });
  it('should on open epub call on delay', async(() => {
    spyOn(component, 'addEvents');
    component.onOpenEpub(book);
    setTimeout(() => {
      expect(component.addEvents).toHaveBeenCalled();
    }, 6);
  }));

  it('should add images src', () => {
    var imgObj = document.createElement('img');
    imgObj.id = 'https://www.google.com';
    component.content.nativeElement.appendChild(imgObj);
    component.addedImages = false;
    component.addEvents();
    expect(component.addedImages).toBeTrue();
  });
  it('should not add images src', () => {
    component.addedImages = true;
    component.addEvents();
    expect(component.addedImages).toBeTrue();
  });
  it('should get Image src', () => {
    const googleUrl =
      'https://www.google.com.mx/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png';
    book.images = [{ name: 'google', url: googleUrl }];
    component.book = book;
    let imageId = component.getImg('google');
    expect(imageId).toContain('www.google.com');
    imageId = component.getImg('youtube');
    expect(imageId).not.toContain('www.google.com');
  });
  it('should get Image src and return default image', () => {
    let imageId = component.getImg('youtube');
    expect(imageId).toContain('anime');
  });
  it('should get the book name', () => {
    component.book = null;
    let theName = component.getBookName();
    expect(theName).toBe('');

    book.name = null;
    component.book = book;
    theName = component.getBookName();
    expect(theName).toBe('');

    book.name = 'Some youtube';
    theName = component.getBookName();
    expect(theName).toBe('Some youtube');
  });
  it('should return the content', () => {
    component.book = null;
    let content = component.getContent();
    expect(content).toBe(null);
    book.pages = [new PageModule('model Name', 'file name', 'some save html')];
    component.book = book;
    content = component.getContent();
    expect(content.length).toBe(1);
  });
});
