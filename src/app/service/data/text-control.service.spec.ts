import { TestBed } from '@angular/core/testing';

import { TextControlService } from './text-control.service';

describe('TextControlService', () => {
  let service: TextControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextControlService);
  });

  //TODO Add unit text to the functions
  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(true).toBe(false);
  });
});
