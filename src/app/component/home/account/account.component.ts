import { Component, OnInit } from '@angular/core';
import { BankService } from 'src/app/services/bank/bank.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { DDL } from '../cheque/cheque';
import { AccountForm, AccountItem } from './account';
import { isEmpty } from '../../../../main';
import { AccountService } from 'src/app/services/account/account.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  constructor(private customerService: CustomerService,
    private bankService: BankService, private branchService: BranchService,
    private accountService: AccountService, private modalService: NgbModal) {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const permission = userInfo?.permission;
      this.permission.canEdit = permission?.edit_permission?.includes('account');
      this.permission.canDelete = permission?.delete_permission?.includes('account');
      this.getCustomerDDL();
      this.getBankDDL();
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        sessionStorage.clear();
        window.location.reload();
        return;
      }
    }
  }

  customerOptions: DDL[] = [];
  bankOptions: DDL[] = [];
  branchOptions: DDL[] = [];
  form: AccountForm = new AccountForm();
  error = {
    account_no: false,
  }
  fields: string[] = [
    'No.',
    'Account No.',
    'Account Name',
    'Bank Name',
    'Customer Name',
    'Status'
  ];
  items: AccountItem[] = [];
  page: number = 0;
  total: number = 0;
  limit: number = 10;
  is_search = false;
  submitted = false;
  permission = {
    canEdit: false,
    canDelete: false
  };

  ngOnInit(): void {
  }

  async getCustomerDDL() {
    try {
      this.customerOptions = [];
      const res = await this.customerService.findCustomer();
      if (res && res.data) {
        res.data.forEach(e => {
          this.customerOptions.push({
            value: e?.customer_id,
            text: this.mapName(e?.name, e?.lastname)
          });
        });
      }
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        sessionStorage.clear();
        window.location.reload();
        return;
      }
    }
  }

  async getBankDDL() {
    this.bankOptions = [];
    const res = await this.bankService.findBank();
    if (res && res.data) {
      res.data.forEach(e => {
        this.bankOptions.push({
          value: e?.bank_id,
          text: e?.bank_name
        });
      });
    }
  }

  async getBranchDDL(bank_id) {
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

  async onChangeBank() {
    const bank_id = this.form.bank_id;
    this.getBranchDDL(bank_id);
  }

  pagination(page: number) {
    this.page = page;
    this.searchBtn();
  }

  mapName(name, lastname) {
    return name ? lastname ? `${name} ${lastname}` : name : lastname ? lastname : '-';
  }

  validate() {
    this.submitted = true;
    let valid = true;
    if (this.form.account_no && isNaN(+this.form.account_no)) {
      this.error.account_no = true;
      valid = false;
    }
    return valid;
  }

  async searchBtn() {
    if (!this.validate()) return;
    try {
      this.is_search = true;
      const skip = this.page * this.limit;
      let req: any = {};
      if (this.form.account_no) req.account_no = this.form.account_no;
      if (this.form.account_name) req.account_name = this.form.account_name;
      if (this.form.customer_id) req.customer_id = this.form.customer_id;
      if (this.form.bank_id) req.bank_id = this.form.bank_id;
      if (this.form.branch_id) req.branch_id = this.form.branch_id;
      let res;
      if (!isEmpty(req)) {
        res = await this.accountService.searchAccount(req, skip);
      } else {
        res = await this.accountService.findAccount(skip);
      }
      this.setTableItems(res?.data?.data);
      this.total = res?.data.total;
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        sessionStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(e?.response?.data?.message || e);
    }
  }

  setTableItems(data: any[]) {
    if (isEmpty(data)) return;
    this.items = [];
    data.forEach((e, i) => {
      this.items.push({
        no: (i + 1) + (this.page * this.limit),
        account_id: e?.id,
        account_no: e?.account_no,
        account_name: e?.account_name,
        bank_name: e.bank.bank_name,
        branch_name: e?.branch.branch_name,
        customer_name: this.mapName(e?.customer.name, e?.customer.lastname),
        status: e?.is_active ? 'Active' : 'Inactive'
      });
    });
  }

  async showModalEdit(i: number) {
    // const modalRef = this.modalService.open(ModalAddAccountComponent, { size: 'lg', centered: true, backdrop: 'static' });
    // modalRef.componentInstance.customerOptions = this.customerOptions;
    // modalRef.componentInstance.bankOptions = this.bankOptions;
    // modalRef.result.then(() => {
    //   this.form = new AccountForm();
    //   this.searchBtn();
    // });
  }

  clearBtn() {
    this.is_search = false;
    this.submitted = false;
    this.form = new AccountForm();
    this.error = {
      account_no: false
    }
    this.total = 0;
    this.branchOptions = [];
  }

  errorMsg(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }

}
