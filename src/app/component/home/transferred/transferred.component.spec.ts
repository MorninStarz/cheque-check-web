import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferredComponent } from './transferred.component';

describe('TransferredComponent', () => {
  let component: TransferredComponent;
  let fixture: ComponentFixture<TransferredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
