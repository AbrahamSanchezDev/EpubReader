import { TestBed } from '@angular/core/testing';

import { SaveDataInLocalStorageService } from './save-data-in-local-storage.service';

export class testingSave {
  id: number = 0;
  name: string = 'The Name';
}
export class testingSaveService extends SaveDataInLocalStorageService<
  testingSave
> {}
describe('EpubSaveDataService', () => {
  let service: testingSaveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(testingSaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
