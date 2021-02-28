import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { TransferService } from 'src/app/services/transfer/transfer.service';
import Swal from 'sweetalert2';
import { DDL } from '../../cheque/cheque';
import { AddTransferForm } from './modal-add-transfer';

@Component({
  selector: 'app-modal-add-transfer',
  templateUrl: './modal-add-transfer.component.html',
  styleUrls: ['./modal-add-transfer.component.scss']
})
export class ModalAddTransferComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private transferService: TransferService) { }

  @Input() customerOptions: DDL[];
  customer: FormControl = new FormControl();
  customerFilter: Observable<DDL[]>;
  form: AddTransferForm = new AddTransferForm();
  error = {
    customer_id: false,
    amount: false
  }
  submitted = false;

  ngOnInit(): void {
    this.customerFilter = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => this.customerOptions.filter(option => option.text.includes(value)))
    );
  }

  validate() {
    this.clearError();
    this.submitted = true;
    let valid = true;
    if (this.customer.value) {
      const option = this.customerOptions.filter(e => e.text === this.customer.value);
      if (option && Array.isArray(option) && option.length > 0) this.form.customer_id = option[0].value;
      else {
        this.error.customer_id = true;
        valid = false;
      }
    } else valid = false;
    if (!this.form.amount) valid = false;
    else if (isNaN(+this.form.amount)) {
      valid = false;
      this.error.amount = true;
    }
    return valid;
  }

  async saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'เพิ่มรายการโอน',
      text: 'ต้องการเพิ่มรายการโอนหรือไม่ ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await this.transferService.createTransfer(this.form);
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'เพิ่มรายการโอนสำเร็จ',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.closeBtn();
          });
        } catch (error) {
          if (error?.response?.data?.code === 401) {
            localStorage.clear();
            window.location.reload();
            return;
          }
          Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: error?.response?.data?.message || error?.message
          });
        }
      }
    });
  }

  clearError() {
    this.error = {
      customer_id: false,
      amount: false
    };
  }

  closeBtn() {
    this.form = new AddTransferForm();
    this.submitted = false;
    this.clearError();
    this.activeModal.close();
  }

}
