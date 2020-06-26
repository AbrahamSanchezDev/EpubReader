import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubOptionsComponent } from './epub-options.component';

describe('EpubOptionsComponent', () => {
  let component: EpubOptionsComponent;
  let fixture: ComponentFixture<EpubOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EpubOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EpubOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
