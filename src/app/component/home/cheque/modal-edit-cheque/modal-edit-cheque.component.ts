import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BranchService } from 'src/app/services/branch/branch.service';
import { ChequeService } from 'src/app/services/cheque/cheque.service';
import { DDL } from '../cheque';
import { EditChequeForm } from './modal-edit-cheque';
import * as _ from 'lodash';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-edit-cheque',
  templateUrl: './modal-edit-cheque.component.html',
  styleUrls: ['./modal-edit-cheque.component.scss']
})
export class ModalEditChequeComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private chequeService: ChequeService, private branchService: BranchService) { }

  @Input() cheque: any;
  @Input() customerOptions: DDL[];
  @Input() bankOptions: DDL[];
  branchOptions: DDL[];
  statusOptions: DDL[] = [
    { value: 'Waiting', text: 'Waiting' },
    { value: 'Pending', text: 'Pending' },
    { value: 'Approved', text: 'Approved' }
  ];
  form: EditChequeForm = new EditChequeForm();
  error = {
    cheque_no: false,
    amount: false,
    pending_date: false,
    approve_date: false
  };
  today: Date = new Date();
  submitted = false;

  ngOnInit(): void {
    if (!_.isEmpty(this.cheque)) {
      const bank_id = _.get(this.cheque, 'bank_id');
      this.form.bank_id = bank_id;
      this.onChangeBankName();
      this.form = {
        cheque_id: _.get(this.cheque, 'cheque_id'),
        cheque_no: _.get(this.cheque, 'cheque_no'),
        customer_id: _.get(this.cheque, 'customer_id'),
        bank_id: bank_id,
        branch_id: _.get(this.cheque, 'branch_id'),
        month: _.get(this.cheque, 'month'),
        amount: _.get(this.cheque, 'amount'),
        pending_date: _.get(this.cheque, 'pending_date'),
        approve_date: _.get(this.cheque, 'approve_date'),
        remark: _.get(this.cheque, 'remark'),
        status: _.get(this.cheque, 'status')
      }
    }
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
    else {
      if (this.form.status === 'Pending' && !this.form.pending_date) valid = false;
      if (this.form.status === 'Approved' && !this.form.approve_date) valid = false;
    }
    return valid;
  }

  async saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'Edit Cheque',
      text: 'Are you sure to Edit Cheque ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          let req: any = {};
          if (this.form.cheque_id) req.cheque_id = this.form.cheque_id;
          if (this.form.cheque_no) req.cheque_no = this.form.cheque_no;
          if (this.form.customer_id) req.customer_id = this.form.customer_id;
          if (this.form.bank_id) req.bank_id = this.form.bank_id;
          if (this.form.branch_id) req.branch_id = this.form.branch_id;
          if (this.form.month) req.month = this.form.month;
          if (this.form.amount) req.amount = this.form.amount;
          if (this.form.pending_date) req.pending_date = this.form.pending_date;
          if (this.form.approve_date) req.approve_date = this.form.approve_date;
          if (this.form.remark) req.remark = this.form.remark;
          if (this.form.status) req.status = this.form.status;
          await this.chequeService.editCheque(req);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Cheque has successfully edited',
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
    this.form = new EditChequeForm();
    this.submitted = false;
    this.activeModal.close();
  }

}
