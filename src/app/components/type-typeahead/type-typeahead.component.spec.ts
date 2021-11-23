import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeTypeaheadComponent } from './type-typeahead.component';

describe('TypeaheadComponent', () => {
  let component: TypeTypeaheadComponent;
  let fixture: ComponentFixture<TypeTypeaheadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeTypeaheadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeTypeaheadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
