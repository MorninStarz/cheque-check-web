import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditBankComponent } from './modal-edit-bank.component';

describe('ModalEditBankComponent', () => {
  let component: ModalEditBankComponent;
  let fixture: ComponentFixture<ModalEditBankComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditBankComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditBankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
