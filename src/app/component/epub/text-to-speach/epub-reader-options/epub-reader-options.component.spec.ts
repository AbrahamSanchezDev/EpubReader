import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubReaderOptionsComponent } from './epub-reader-options.component';

describe('EpubReaderOptionsComponent', () => {
  let component: EpubReaderOptionsComponent;
  let fixture: ComponentFixture<EpubReaderOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpubReaderOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubReaderOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
