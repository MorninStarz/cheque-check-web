import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveChequeComponent } from './approve-cheque.component';

describe('ApproveChequeComponent', () => {
  let component: ApproveChequeComponent;
  let fixture: ComponentFixture<ApproveChequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveChequeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveChequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
