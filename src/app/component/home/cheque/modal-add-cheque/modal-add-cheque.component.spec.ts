import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddChequeComponent } from './modal-add-cheque.component';

describe('ModalAddChequeComponent', () => {
  let component: ModalAddChequeComponent;
  let fixture: ComponentFixture<ModalAddChequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAddChequeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddChequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
