import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewBankComponent } from './modal-view-bank.component';

describe('ModalViewBankComponent', () => {
  let component: ModalViewBankComponent;
  let fixture: ComponentFixture<ModalViewBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalViewBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalViewBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
