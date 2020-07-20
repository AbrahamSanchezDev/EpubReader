import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReaderComponent } from './reader.component';

import { HttpClientModule } from '@angular/common/http';
import { EpubService } from 'src/app/service/epub/epub.service';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { DomSanitizer, By } from '@angular/platform-browser';
import { PageModule } from 'src/app/model/epub/page/page.module';

describe('ReaderComponent', () => {
  let component: ReaderComponent;
  let fixture: ComponentFixture<ReaderComponent>;
  const mockFile = new File([''], 'filename', { type: 'text/html' });
  const mockEvt = { target: { files: [mockFile] } };
  let sanitized: DomSanitizer;

  const setBook = () => {
    component.book = new BookObjModule();
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReaderComponent],
      imports: [HttpClientModule],
      providers: [
        EpubService,
        {
          provide: DomSanitizer,
          useValue: {
            sanitize: (ctx: any, val: string) => val,
            bypassSecurityTrustResourceUrl: (val: string) => val,
            bypassSecurityTrustHtml: (val: string) => val,
          },
        },
      ],
    }).compileComponents();
    sanitized = TestBed.inject(DomSanitizer);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReaderComponent);
    component = fixture.componentInstance;
    component.loadTesting = false;
    fixture.detectChanges();
    component.loadTesting = false;
    spyOn(component.loader, 'loadEpub').and.callFake((file) => {
      console.log('On loadEpub');
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should have sanitized component', () => {
    expect(sanitized).toBeTruthy();
  });

  it('should call on the subscribed events', () => {
    spyOn(component, 'loadEpub');
    spyOn(component, 'toggleIndex');
    spyOn(component, 'onBookLoaded');

    component.epubService.OnFileSelected.emit(null);
    component.epubService.OnToggleChapters.emit(null);
    component.epubService.onOpenEpub.emit(null);

    expect(component.loadEpub).toHaveBeenCalled();
    expect(component.toggleIndex).toHaveBeenCalled();
    expect(component.onBookLoaded).toHaveBeenCalled();
  });

  it('should setup the book to load', () => {
    spyOn(component, 'resetData');
    spyOn(component, 'setupButtonsIds');
    component.onBookLoaded(null);
    expect(component.resetData).toHaveBeenCalled();
    expect(component.setupButtonsIds).toHaveBeenCalled();
  });
  it('should call load book from html input', () => {
    spyOn(component, 'loadEpub');
    component.onFileSelected(mockEvt);
    expect(component.loadEpub).toHaveBeenCalled();
  });
  it('should load epub', () => {
    spyOn(component, 'resetData');
    component.loadEpub(null);
    expect(component.resetData).not.toHaveBeenCalled();
    component.loadEpub(mockFile);
    expect(component.resetData).toHaveBeenCalled();
  });
  it('should not setup buttons from the index', () => {
    spyOn(component, 'setElementToIndexSaveHtml');
    setBook();
    component.setupButtonsIds();
    expect(component.setElementToIndexSaveHtml).not.toHaveBeenCalled();
  });
  it('should not setup index if the element is null', () => {
    spyOn(component, 'setElementToIndexSaveHtml');

    component.elementRef = null;
    setBook();
    component.book.index = sanitized.bypassSecurityTrustHtml(
      'some text <div> more </div>'
    );
    component.setupButtonsIds();
    expect(component.setElementToIndexSaveHtml).not.toHaveBeenCalled();
  });

  it('should setup buttons from the index', async(() => {
    spyOn(component, 'addContentId');
    setBook();
    component.book.index = sanitized.bypassSecurityTrustHtml(
      'some text <button> more </button>'
    );
    component.setupButtonsIds();
    expect(component.elementRef.nativeElement.innerHTML).not.toBe('');
    console.log(component.elementRef.nativeElement.innerHTML);

    var but = document.createElement('button');
    component.elementRef.nativeElement.appendChild(but);

    setTimeout(() => {
      component.getButtonsAndSetThem();
      expect(component.addContentId).toHaveBeenCalled();
    }, 50);
  }));
  it('should resetData', () => {
    setBook();
    component.resetData();
    expect(component.book).toBeNull();
  });

  it('should setup buttons ids', () => {
    spyOn(component, 'addContentId');
    setBook();
    component.book.usePagesAsMenu = true;
    component.elementRef.nativeElement.innerHTML = sanitized.bypassSecurityTrustHtml(
      'some text <button> more </button>'
    );
    var but = document.createElement('button');
    component.elementRef.nativeElement.appendChild(but);
    component.getButtonsAndSetThem();

    expect(component.addContentId).toHaveBeenCalled();

    component.book.usePagesAsMenu = false;
    component.getButtonsAndSetThem();
    expect(component.addContentId).toHaveBeenCalled();
    spyOn(component, 'skipTo');
    but.click();
    expect(component.skipTo).toHaveBeenCalled();
  });
  it('should add id to the service', () => {
    spyOn(component.epubService, 'addContentId');
    component.addContentId('id');
    expect(component.epubService.addContentId).toHaveBeenCalled();
  });
  it('should not skip to the element', () => {
    const testId = 'someID';
    var div = document.createElement('div');
    div.id = 'some other';
    spyOn(div, 'scrollIntoView');
    component.skipTo(testId);
    expect(div.scrollIntoView).not.toHaveBeenCalled();
  });
  it('should skip to the element', () => {
    const testId = 'someID123';
    var div = document.createElement('div');
    div.id = testId;
    fixture.debugElement.nativeElement.appendChild(div);
    spyOn(div, 'scrollIntoView');
    component.skipTo(testId);
    expect(div.scrollIntoView).toHaveBeenCalled();
  });
  it('should check if the book should use content as menu', () => {
    let cur = component.useContentAsMenu();
    expect(cur).toBeFalse();
    setBook();
    cur = component.useContentAsMenu();
    expect(cur).toBeFalse();
    component.book.usePagesAsMenu = true;
    cur = component.useContentAsMenu();
    expect(cur).toBeTrue();
  });

  it('should return the content', () => {
    let curValue = component.getContent();
    expect(curValue).toBeNull();
    setBook();
    curValue = component.getContent();
    expect(curValue).not.toBeNull();
  });
  it('should return the name of the page', () => {
    const testingPage = new PageModule('someName', 'fullName', null);
    let curValue = component.getContentName(null);
    expect(curValue).toBe('');
    //With valid values
    curValue = component.getContentName(testingPage);
    expect(curValue).toBe('someName');
  });
  it('should should toggle the show index', () => {
    component.opened = false;
    component.toggleIndex();
    expect(component.opened).toBeTrue();
  });
});
