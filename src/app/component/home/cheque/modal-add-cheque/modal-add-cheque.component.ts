import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BranchService } from 'src/app/services/branch/branch.service';
import { ChequeService } from 'src/app/services/cheque/cheque.service';
import { DDL } from '../cheque';
import { AddChequeForm } from './modal-add-cheque';
import * as _ from 'lodash';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-add-cheque',
  templateUrl: './modal-add-cheque.component.html',
  styleUrls: ['./modal-add-cheque.component.scss']
})
export class ModalAddChequeComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private chequeService: ChequeService, private branchService: BranchService) { }

  @Input() customerOptions: DDL[];
  @Input() bankOptions: DDL[];
  branchOptions: DDL[];
  statusOptions: DDL[] = [
    { value: 'Waiting', text: 'Waiting' },
    { value: 'Pending', text: 'Pending' },
    { value: 'Approved', text: 'Approved' }
  ];
  form: AddChequeForm = new AddChequeForm();
  error = {
    cheque_no: false,
    amount: false,
    pending_date: false,
    approve_date: false
  };
  today: Date = new Date();
  submitted = false;

  ngOnInit(): void {
    
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
    this.submitted = true;
    this.error = {
      cheque_no: false,
      amount: false,
      pending_date: false,
      approve_date: false
    };
    let valid = true;
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
    if (!this.form.status) valid = false;
    return valid;
  }

  async saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'Add Cheque',
      text: 'Are you sure to Add Cheque ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await this.chequeService.addCheque(this.form);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Cheque has successfully created',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.closeBtn();
          });
        } catch (e) {
          if (e?.response?.data?.code === 401) {
            sessionStorage.clear();
            window.location.reload();
            return;
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: e?.response?.data?.message || e?.message
          });
        }
      }
    });
  }

  closeBtn() {
    this.form = new AddChequeForm();
    this.submitted = false;
    this.activeModal.close();
  }

}
