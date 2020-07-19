import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';

import { TextToSpeechService } from './text-to-speech.service';

describe('TextToSpeechService', () => {
  let service: TextToSpeechService;

  let voices: SpeechSynthesisVoice[];
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextToSpeechService);
  });
  beforeEach(async(() => {
    if (voices == null) {
      voices = [];
      let awaitVoices = new Promise(
        (resolve) => (window.speechSynthesis.onvoiceschanged = resolve)
      );
      awaitVoices.then(() => {
        voices = speechSynthesis.getVoices();
      });
    }
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should cancel if it is reading on', () => {
    spyOn(service.speech, 'cancel');
    service.reading = false;
    const unload = new Event('beforeunload');
    window.dispatchEvent(unload);
    expect(service.speech.cancel).not.toHaveBeenCalled();
    service.reading = true;
    window.dispatchEvent(unload);
    expect(service.speech.cancel).toHaveBeenCalled();
  });

  it('should cancel the speech', () => {
    service.reading = true;
    service.cancelSpeech();
    expect(service.reading).toBe(false);
  });

  it('should read the given text', async(() => {
    setTimeout(() => {
      service.speech = window.speechSynthesis;
      spyOn(service.speech, 'getVoices').and.returnValues(voices);
      service.getVoices();

      console.log(voices);

      expect(voices).not.toBeNull();
      expect(service.allVoices.length).not.toBe(0);
      const testText = 'Some Text';
      spyOn(service.speech, 'speak');

      service.speechOptions.voice = service.allVoices[0];
      service.selectedValue = voices[1].name.toString();
      service.read(testText);
      expect(service.speechOptions.voice.name).toBe(voices[1].name);
      //Check that it didn't change if the selected value was didn't match any voice
      service.speechOptions.voice = service.allVoices[0];
      service.selectedValue = 'some other';
      service.read(testText);
      expect(service.speechOptions.voice.name).toBe(voices[0].name);
    }, 500);
  }));

  it('should set selected voice', () => {
    service.setVoice('someVoice');
    expect(service.selectedValue).toBe('someVoice');
  });

  it('should set pitch', () => {
    service.setPitch(2);
    expect(service.speechOptions.pitch).toBe(2);
  });
  it('should set rate', () => {
    service.setRate(2);
    expect(service.speechOptions.rate).toBe(2);
  });
  it('should set volume', () => {
    service.setVolume(0.5);
    expect(service.speechOptions.volume).toBe(0.5);
  });
});
