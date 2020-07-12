import { TestBed } from '@angular/core/testing';

import { EpubTextFormatService } from './epub-text-format.service';

fdescribe('EpubTextFormatService', () => {
  let service: EpubTextFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubTextFormatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
