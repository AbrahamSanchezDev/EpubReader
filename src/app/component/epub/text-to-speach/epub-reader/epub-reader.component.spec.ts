import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubReaderComponent } from './epub-reader.component';

describe('EpubReaderComponent', () => {
  let component: EpubReaderComponent;
  let fixture: ComponentFixture<EpubReaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpubReaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
