import { TestBed } from '@angular/core/testing';

import { EpubLoaderService } from './epub-loader.service';

describe('EpubLoaderService', () => {
  let service: EpubLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
