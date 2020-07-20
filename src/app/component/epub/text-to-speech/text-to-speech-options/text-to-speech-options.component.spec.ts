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

  it('should change voice', () => {
    spyOn(component.textToSpeech, 'setVoice');
    component.onChangeVoice('Some Voice');
    expect(component.textToSpeech.setVoice).toHaveBeenCalled();
  });
  it('should change pitch', () => {
    spyOn(component.textToSpeech, 'setPitch');
    component.onPitch(0.5);
    expect(component.textToSpeech.setPitch).toHaveBeenCalled();
  });
  it('should change rate', () => {
    spyOn(component.textToSpeech, 'setRate');
    component.onRate(0.5);
    expect(component.textToSpeech.setRate).toHaveBeenCalled();
  });
  it('should change voice', () => {
    spyOn(component.textToSpeech, 'setVolume');
    component.onVolume(0.5);
    expect(component.textToSpeech.setVolume).toHaveBeenCalled();
  });
});
