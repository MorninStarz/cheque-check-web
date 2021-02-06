import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEditChequeComponent } from './modal-edit-cheque.component';

describe('ModalEditChequeComponent', () => {
  let component: ModalEditChequeComponent;
  let fixture: ComponentFixture<ModalEditChequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalEditChequeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalEditChequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
