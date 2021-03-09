import { TestBed } from '@angular/core/testing';

import { EclService } from './ecl.service';

describe('EclService', () => {
  let service: EclService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EclService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
