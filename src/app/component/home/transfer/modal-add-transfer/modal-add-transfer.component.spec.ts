import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddTransferComponent } from './modal-add-transfer.component';

describe('ModalAddTransferComponent', () => {
  let component: ModalAddTransferComponent;
  let fixture: ComponentFixture<ModalAddTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAddTransferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
