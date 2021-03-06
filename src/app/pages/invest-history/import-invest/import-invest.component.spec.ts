import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportInvestComponent } from './import-invest.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ImportInvestComponent', () => {
  let component: ImportInvestComponent;
  let fixture: ComponentFixture<ImportInvestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportInvestComponent ],
      imports: [HttpClientTestingModule]
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
