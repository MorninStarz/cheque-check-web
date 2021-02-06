import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddBankComponent } from './modal-add-bank.component';

describe('ModalAddComponent', () => {
  let component: ModalAddBankComponent;
  let fixture: ComponentFixture<ModalAddBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAddBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
