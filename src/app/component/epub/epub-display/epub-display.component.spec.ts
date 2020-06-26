import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubDisplayComponent } from './epub-display.component';

describe('EpubDisplayComponent', () => {
  let component: EpubDisplayComponent;
  let fixture: ComponentFixture<EpubDisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpubDisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
