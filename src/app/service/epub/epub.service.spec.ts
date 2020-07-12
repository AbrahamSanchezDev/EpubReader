import { TestBed } from '@angular/core/testing';
import { EpubService } from './epub.service';

describe('EpubService', () => {
  let service: EpubService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EpubService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should call on Open', () => {
    spyOn(service.onOpenEpub, 'emit');
    service.callOnOpenEpub(null);
    expect(service.onOpenEpub.emit).toHaveBeenCalled();
  });

  it('should add and remove the ids', () => {
    service.addContentId('myId');
    let total = service.getIds().length;
    expect(total).toBe(1);
    service.clearIds();
    total = service.getIds().length;
    expect(total).toBe(0);
  });

  it('should call toggle chapters', () => {
    spyOn(service.OnToggleChapters, 'emit');
    service.toggleChapters();
    expect(service.OnToggleChapters.emit).toHaveBeenCalled();
  });
});
