import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from 'src/app/services/customer/customer.service';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { CustomerTable } from '../customer';
import { ModalEditForm } from './modal-edit';
import { isEmpty } from 'src/main';
import { AccountService } from 'src/app/services/account/account.service';
import { DDL } from '../../cheque/cheque';
import { BranchService } from 'src/app/services/branch/branch.service';
import { BankService } from 'src/app/services/bank/bank.service';
import { AccountData } from '../../account/account';

@Component({
  selector: 'app-modal-edit',
  templateUrl: './modal-edit.component.html',
  styleUrls: ['./modal-edit.component.scss']
})
export class ModalEditComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private customerService: CustomerService, 
    private router: Router, private accountService: AccountService,
    private bankService: BankService, private branchService: BranchService) { 
    
  }

  @Input() customer: CustomerTable;

  form: ModalEditForm = new ModalEditForm();
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
    this.initData();
  }

  async initData() {
    try {
      const res = await this.accountService.searchAccount({ customer_id: this.customer.customer_id }, 0);
      let accounts: AccountData[] = [];
      await res?.data?.data.forEach(async (e, i) => {
        accounts.push({
          account_id: e.account_id,
          account_no: e.account_no,
          account_name: e.account_name,
          bank_id: e.bank.bank_id,
          branch_id: e.branch.branch_id
        });
        await this.getBankDDL(i);
        await this.getBranchDDL(i, e.bank.bank_id);
        this.error_account.push({
          account_no: false
        });
      });
      this.form = {
        name: this.customer.name,
        lastname: this.customer.lastname,
        mobile: this.customer.mobile,
        accounts: accounts,
        expect_amount: this.customer.expect ? this.customer.expect.toString() : '',
        actual_amount: this.customer.actual ? this.customer.actual.toString() : '',
        due_date: new Date(this.customer.due_date)
      }
    } catch (e) {
      if (e.status === 401) {
        this.router.navigate(['/']);
        return;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.response.data.message
      });
    }
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

  validate() {
    this.submitted = true;
    this.clearError();
    let valid = true;
    if (!this.form.name) valid = false;
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

  saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'Edit Customer',
      text: 'Are you sure to Edit Customer ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          let req: any = {};
          if (this.form.name) req.name = this.form.name;
          if (this.form.lastname) req.lastname = this.form.lastname;
          if (this.form.mobile) req.mobile = this.form.mobile;
          if (this.form.accounts) req.accounts = this.form.accounts;
          if (this.form.expect_amount) req.expect_amount = this.form.expect_amount;
          if (this.form.actual_amount) req.actual_amount = this.form.actual_amount;
          if (this.form.due_date) req.due_date = this.form.due_date;
          if (_.isEmpty(req)) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Customer has successfully edited',
              allowEscapeKey: false,
              allowOutsideClick: false
            }).then(() => {
              this.closeBtn();
            });
          }
          const customer_id = _.get(this.customer, 'customer_id');
          await this.customerService.editCustomer(customer_id, req);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Customer has successfully edited',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.closeBtn();
          });
        } catch (e) {
          if (e.status === 401) {
            this.router.navigate(['/']);
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
    this.form = new ModalEditForm();
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
