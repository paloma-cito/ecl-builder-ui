import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EclBuilderComponent } from './ecl-builder.component';

describe('EclBuilderComponent', () => {
  let component: EclBuilderComponent;
  let fixture: ComponentFixture<EclBuilderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EclBuilderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EclBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
