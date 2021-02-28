import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitingChequeComponent } from './waiting-cheque.component';

describe('WaitingChequeComponent', () => {
  let component: WaitingChequeComponent;
  let fixture: ComponentFixture<WaitingChequeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WaitingChequeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WaitingChequeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
