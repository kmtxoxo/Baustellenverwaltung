import { TestBed } from '@angular/core/testing';

import { ConstructionSiteService } from './construction-site.service';

describe('ConstructionSiteService', () => {
  let service: ConstructionSiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConstructionSiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
