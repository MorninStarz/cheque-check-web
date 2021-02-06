import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddCashComponent } from './modal-add-cash.component';

describe('ModalAddCashComponent', () => {
  let component: ModalAddCashComponent;
  let fixture: ComponentFixture<ModalAddCashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalAddCashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
