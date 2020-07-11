import { TestBed } from '@angular/core/testing';

import { EpubSaveDataService } from './epub-save-data.service';

describe('EpubSaveDataService', () => {
  let service: EpubSaveDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubSaveDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
