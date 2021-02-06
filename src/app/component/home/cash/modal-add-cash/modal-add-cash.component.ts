import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AccountService } from 'src/app/services/account/account.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { CashService } from 'src/app/services/cash/cash.service';
import Swal from 'sweetalert2';
import { DDL } from '../../cheque/cheque';
import { AddCashForm } from './modal-add-cash';

@Component({
  selector: 'app-modal-add-cash',
  templateUrl: './modal-add-cash.component.html',
  styleUrls: ['./modal-add-cash.component.scss']
})
export class ModalAddCashComponent implements OnInit {

  constructor(private branchService: BranchService, private accountService: AccountService, 
    public activeModal: NgbActiveModal, private cashService: CashService) { }

  @Input() customerOptions: DDL[];
  @Input() bankOptions: DDL[];
  branchOptions: DDL[];
  accountOptions: DDL[];
  form: AddCashForm = new AddCashForm();
  error = {
    amount: false,
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
      res.data.forEach(e => {
        this.branchOptions.push({
          value: e?.branch_id,
          text: e?.branch_name
        });
      });
    }
  }

  async onChangeCustomer() {
    const customer_id = this.form.customer_id;
    this.accountOptions = [];
    const res = await this.accountService.getAccount(customer_id);
    if (res && Array.isArray(res.data)) {
      res.data.forEach(e => {
        this.accountOptions.push({
          value: e?.account_id,
          text: e?.account_no
        });
      });
    }
  }

  validate() {
    this.submitted = true;
    this.error = {
      amount: false
    };
    let valid = true;
    if (!this.form.account_id) valid = false;
    if (!this.form.customer_id) valid = false;
    if (!this.form.bank_id) valid = false;
    if (!this.form.branch_id) valid = false;
    if (!this.form.transfer_date) valid = false;
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
      title: 'Add Cash Transfer',
      text: 'Are you sure to Add Cash Transfer ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await this.cashService.createTransfer(this.form);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Cash Transfer has successfully created',
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
    this.form = new AddCashForm();
    this.submitted = false;
    this.activeModal.close();
  }

}
