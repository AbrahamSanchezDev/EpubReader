import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EpubOptionsComponent } from './epub-options.component';
import { InUseMaterialModule } from 'src/app/material-module';

describe('EpubOptionsComponent', () => {
  let component: EpubOptionsComponent;
  let fixture: ComponentFixture<EpubOptionsComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EpubOptionsComponent],

      imports: [InUseMaterialModule],
    }).compileComponents();
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
