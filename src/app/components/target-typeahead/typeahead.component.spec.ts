import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetTypeaheadComponent } from './target-typeahead.component';

describe('TypeaheadComponent', () => {
  let component: TargetTypeaheadComponent;
  let fixture: ComponentFixture<TargetTypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TargetTypeaheadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TargetTypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
