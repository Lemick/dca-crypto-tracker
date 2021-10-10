import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportInvestComponent } from './import-invest.component';

describe('ImportInvestComponent', () => {
  let component: ImportInvestComponent;
  let fixture: ComponentFixture<ImportInvestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportInvestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportInvestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
