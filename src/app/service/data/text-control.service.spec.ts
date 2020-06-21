import { TestBed } from '@angular/core/testing';

import { TextControlService } from './text-control.service';

describe('TextControlService', () => {
  let service: TextControlService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TextControlService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
