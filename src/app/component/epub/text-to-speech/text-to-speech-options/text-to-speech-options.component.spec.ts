import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextToSpeechOptionsComponent } from './text-to-speech-options.component';

import { MatDialogRef, MatDialog } from '@angular/material/dialog';

describe('TextToSpeechOptionsComponent', () => {
  let component: TextToSpeechOptionsComponent;
  let fixture: ComponentFixture<TextToSpeechOptionsComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close'),
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TextToSpeechOptionsComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef,
        },
        MatDialog,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextToSpeechOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
