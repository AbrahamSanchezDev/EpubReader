import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextToSpeechOptionsComponent } from './text-to-speech-options.component';

describe('TextToSpeechOptionsComponent', () => {
  let component: TextToSpeechOptionsComponent;
  let fixture: ComponentFixture<TextToSpeechOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextToSpeechOptionsComponent ]
    })
    .compileComponents();
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
