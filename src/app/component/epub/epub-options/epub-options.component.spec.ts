import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EpubOptionsComponent } from './epub-options.component';
import { BookObjModule } from 'src/app/model/epub/page/book-obj.module';
import { TestingData } from 'src/app/testing/testing-base';
import { MatDialogModule } from '@angular/material/dialog';

describe('EpubOptionsComponent', () => {
  let component: EpubOptionsComponent;
  let fixture: ComponentFixture<EpubOptionsComponent>;
  let book: BookObjModule;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      // 1. En Angular 21, los componentes Standalone van en 'imports', NO en 'declarations'
      imports: [
        EpubOptionsComponent,
        MatDialogModule, // Único módulo de Material requerido para simular el diálogo
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    book = new BookObjModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get the subscribed events', () => {
    spyOn(component, 'onOpenEpub');
    spyOn(component, 'onRead');

    component.epubService.onOpenEpub.emit(book); // Emitimos un libro real para evitar problemas estrictos
    component.epubService.OnRead.emit(false);

    expect(component.onOpenEpub).toHaveBeenCalled();
    expect(component.onRead).toHaveBeenCalled();
  });

  // 2. Optimizamos con fakeAsync/tick para que la prueba del setTimeout sea 100% síncrona y confiable
  it('should set book after delay', fakeAsync(() => {
    component.book = null;
    component.onOpenEpub(book);
    expect(component.book).toBe(null);

    tick(10); // Adelanta virtualmente el reloj 10ms (superando los 5ms del setTimeout)
    expect(component.book).not.toBe(null);
  }));

  it('should check if has book', () => {
    component.book = null;
    const hasBook = component.hasBook();
    expect(hasBook).toBeFalse();
  });

  it('should change the reading state', () => {
    component.readingAtm = false;
    component.onRead(true);
    expect(component.readingAtm).toBeTrue();
  });

  it('should change the reading state via service', () => {
    spyOn(component.epubService.OnReadNext, 'emit');
    component.readNext();
    expect(component.epubService.OnReadNext.emit).toHaveBeenCalledWith(true);
    component.readPreviews();
    expect(component.epubService.OnReadNext.emit).toHaveBeenCalledWith(false);
  });

  it('should call the event to load file', () => {
    spyOn(component.epubService.OnFileSelected, 'emit');
    component.onFileSelected(TestingData.mockFileEvent as unknown as Event);
    expect(component.epubService.OnFileSelected.emit).toHaveBeenCalled();
  });

  it('should toggle read', () => {
    spyOn(component.epubService.OnRead, 'emit');
    component.book = null;
    component.toggleRead();
    expect(component.epubService.OnRead.emit).not.toHaveBeenCalled();
    component.book = book;
    component.readingAtm = false;
    component.toggleRead();
    expect(component.readingAtm).toBeTrue();
    expect(component.epubService.OnRead.emit).toHaveBeenCalled();
  });

  it('should toggle the display of chapters', () => {
    spyOn(component.epubService, 'toggleChapters');
    component.showChapters();
    expect(component.epubService.toggleChapters).toHaveBeenCalled();
  });

  it('should open dialog', () => {
    spyOn(component.dialog, 'open');
    component.showReadOptions();
    expect(component.dialog.open).toHaveBeenCalled();
  });

  it('should get the text to display in the chapters menu', () => {
    component.book = null;
    let theText = component.getIndexText();
    expect(theText).toBe('');
    component.book = book;
    theText = component.getIndexText();
    expect(theText).not.toBe('');
  });

  it('should get the text to display in the read out load menu', () => {
    component.book = null;
    let theText = component.getReadText();
    expect(theText).toBe('');
    component.book = book;
    component.readingAtm = false;

    theText = component.getReadText();
    expect(theText).not.toContain('Stop');
    component.readingAtm = true;

    theText = component.getReadText();
    expect(theText).toContain('Stop');
  });
});
