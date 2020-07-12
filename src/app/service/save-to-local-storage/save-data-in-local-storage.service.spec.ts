import { TestBed } from '@angular/core/testing';

import { SaveDataInLocalStorageService } from './save-data-in-local-storage.service';

export class testingSave {
  id: number = 0;
  name: string = 'The Name';
}
export class testingSaveService extends SaveDataInLocalStorageService<
  testingSave
> {}
describe('SaveDataInLocalStorageService', () => {
  let service: testingSaveService;

  const testingData = new testingSave();
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new testingSaveService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save the data', () => {
    spyOn(localStorage, 'setItem');
    service.saveDataFor(testingData.name, testingData);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('should load the data', () => {
    spyOn(localStorage, 'getItem').and.callFake((key) => {
      if (key == testingData.name) {
        return JSON.stringify(testingData);
      } else return null;
    });
    let loaded = service.loadDataFor(testingData.name);
    expect(localStorage.getItem).toHaveBeenCalled();
    expect(loaded.name).toBe(testingData.name);
    //Check for some other key that is not saved
    loaded = service.loadDataFor('some Other');
    expect(loaded).toBe(null);
  });

  it('should delete the data', () => {
    spyOn(localStorage, 'removeItem');
    service.deleteDataFor(testingData.name);
    expect(localStorage.removeItem).toHaveBeenCalled();
  });
});
