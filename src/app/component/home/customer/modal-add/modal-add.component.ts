import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BankService } from 'src/app/services/bank/bank.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import Swal from 'sweetalert2';
import { AccountData } from '../../account/account';
import { DDL } from '../../cheque/cheque';
import { ModalAddForm } from './modal-add';

@Component({
  selector: 'app-modal-add',
  templateUrl: './modal-add.component.html',
  styleUrls: ['./modal-add.component.scss']
})
export class ModalAddComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private customerService: CustomerService,
    private bankService: BankService, private branchService: BranchService) { 
      this.getBankDDL(0);
      this.branchOptions.push([]);
  }

  form: ModalAddForm = new ModalAddForm();
  error = {
    mobile: false,
    expect_amount: false,
    actual_amount: false
  };
  error_account = [];
  submitted = false;
  today: Date = new Date();
  bankOptions: DDL[][] = [];
  bankOption: DDL[] = [];
  branchOptions: DDL[][] = [];

  ngOnInit(): void {
  }

  async getBankDDL(i: number) {
    this.bankOptions[i] = [];
    if (this.bankOption.length > 0) {
      this.bankOptions[i] = [ ...this.bankOption ];
    } else {
      const res = await this.bankService.findBank();
    if (res && res.data) {
      res.data.forEach(e => {
        this.bankOptions[i].push({
          value: e?.bank_id,
          text: e?.bank_name
        });
      });
    }
    }
  }

  async getBranchDDL(i: number, bank_id: string) {
    this.branchOptions[i] = [];
    const res = await this.branchService.findBranchByBankId(bank_id);
    if (res && res.data) {
      res.data.forEach(e => {
        this.branchOptions[i].push({
          value: e?.branch_id,
          text: e?.branch_name
        });
      });
    }
  }

  async onChangeBank(i: number) {
    const bank_id = this.form.accounts[i].bank_id;
    this.getBranchDDL(i, bank_id);
  }

  validate() {
    this.submitted = true;
    this.clearError();
    let valid = true;
    if (!this.form.name) valid = false;
    if (!this.form.accounts) valid = false;
    if (this.form.mobile && isNaN(+this.form.mobile)) {
      valid = false;
      this.error.mobile = true;
    }
    if (this.form.expect_amount && isNaN(+this.form.expect_amount)) {
      valid = false;
      this.error.expect_amount = true;
    }
    if (this.form.actual_amount && isNaN(+this.form.actual_amount)) {
      valid = false;
      this.error.actual_amount = true;
    }
    this.form.accounts.forEach((e, i) => {
      if (!e.account_name) valid = false;
      if (!e.account_no) valid = false;
      else if (isNaN(+e.account_no)) {
        this.error_account[i].account_no = true;
        valid = false;
      }
      if (!e.bank_id) valid = false;
      if (!e.branch_id) valid = false;
      return;
    });
    return valid;
  }

  addAccount() {
    this.form.accounts.push(new AccountData());
    this.error_account.push({
      account_no: false
    });
    this.getBankDDL(this.form.accounts.length - 1);
    this.branchOptions.push([]);
  }

  removeAccount(i: number) {
    this.form.accounts.splice(i, 1);
    this.error_account.splice(i, 1);
    this.bankOptions.splice(i, 1);
    this.branchOptions.splice(i, 1);
  }

  saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'Add Customer',
      text: 'Are you sure to Add Customer ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          if (!this.form.actual_amount) this.form.actual_amount = '0';
          await this.customerService.createCustomer(this.form);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Customer has successfully created',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.closeBtn();
          });
          
        } catch (e) {
          if (e.response.data.code === 401) {
            sessionStorage.clear();
            window.location.reload();
            return;
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: e.response.data.message
          });
        }
      }
    });
  }

  closeBtn() {
    for (let i = 0; i < this.form.accounts.length; i++) {
      this.error_account[i] = {
        account_no: false
      }
    }
    this.form = new ModalAddForm();
    this.error = {
      mobile: false,
      expect_amount: false,
      actual_amount: false
    };
    this.submitted = false;
    this.activeModal.close();
  }

  clearError() {
    this.error = {
      mobile: false,
      expect_amount: false,
      actual_amount: false
    };
    for (let i = 0; i < this.form.accounts.length; i++) {
      this.error_account[i] = {
        account_no: false
      }
    }
  }

}
