import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestComponent } from './add-invest.component';

describe('AddInvestComponent', () => {
  let component: AddInvestComponent;
  let fixture: ComponentFixture<AddInvestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddInvestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInvestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
