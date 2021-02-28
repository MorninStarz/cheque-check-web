import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BranchService } from 'src/app/services/branch/branch.service';
import { ChequeService } from 'src/app/services/cheque/cheque.service';
import { DDL } from '../cheque';
import { AddChequeForm } from './modal-add-cheque';
import * as _ from 'lodash';
import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-modal-add-cheque',
  templateUrl: './modal-add-cheque.component.html',
  styleUrls: ['./modal-add-cheque.component.scss']
})
export class ModalAddChequeComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private chequeService: ChequeService, private branchService: BranchService) { }

  @Input() customerOptions: DDL[];
  @Input() bankOptions: DDL[];
  customer: FormControl = new FormControl();
  customerFilter: Observable<DDL[]>;
  branchOptions: DDL[];
  statusOptions: DDL[] = [
    { value: 'Waiting', text: 'Waiting' },
    { value: 'Pending', text: 'Pending' },
    { value: 'Approved', text: 'Approved' }
  ];
  form: AddChequeForm = new AddChequeForm();
  error = {
    customer_id: false,
    cheque_no: false,
    amount: false,
    pending_date: false
  };
  submitted = false;

  ngOnInit(): void {
    this.customerFilter = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => this.customerOptions.filter(option => option.text.includes(value)))
    );
  }

  async onChangeBankName() {
    const bank_id = this.form.bank_id;
    this.branchOptions = [];
    const res = await this.branchService.findBranchByBankId(bank_id);
    if (res && res.data) {
      _.forEach(res.data, (e) => {
        this.branchOptions.push({
          value: _.get(e, 'branch_id'),
          text: _.get(e, 'branch_name')
        });
      });
    }
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
    if (!this.form.cheque_no) valid = false;
    else if (isNaN(+this.form.cheque_no)) {
      valid = false;
      this.error.cheque_no = true;
    }
    if (!this.form.customer_id) valid = false;
    if (!this.form.bank_id) valid = false;
    if (!this.form.branch_id) valid = false;
    if (!this.form.amount) valid = false;
    else if (isNaN(+this.form.amount)) {
      valid = false;
      this.error.amount = true;
    }
    if (!this.form.pending_date) valid = false;
    return valid;
  }

  async saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'เพิ่มเช็ค',
      text: 'ต้องการเพิ่มเช็คหรือไม่ ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await this.chequeService.addCheque(this.form);
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'เพิ่มเช็คสำเร็จ',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.closeBtn();
          });
        } catch (e) {
          if (e?.response?.data?.code === 401) {
            localStorage.clear();
            window.location.reload();
            return;
          }
          Swal.fire({
            icon: 'error',
            title: 'ผิดพลาด',
            text: e?.response?.data?.message || e?.message
          });
        }
      }
    });
  }

  clearError() {
    this.error = {
      customer_id: false,
      cheque_no: false,
      amount: false,
      pending_date: false
    };
  }

  closeBtn() {
    this.form = new AddChequeForm();
    this.submitted = false;
    this.clearError();
    this.activeModal.close();
  }

}
