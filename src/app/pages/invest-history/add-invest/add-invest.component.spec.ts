import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInvestComponent } from './add-invest.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

describe('AddInvestComponent', () => {
  let component: AddInvestComponent;
  let fixture: ComponentFixture<AddInvestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddInvestComponent ],
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule ]
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
