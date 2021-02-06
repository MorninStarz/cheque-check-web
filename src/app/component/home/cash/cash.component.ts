import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BankService } from 'src/app/services/bank/bank.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { DDL } from '../cheque/cheque';
import { CashForm, CashItem } from './cash';
import numeral from 'numeral';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { isEmpty } from 'src/main';
import { CashService } from 'src/app/services/cash/cash.service';
import { AccountService } from 'src/app/services/account/account.service';
import { ModalAddCashComponent } from './modal-add-cash/modal-add-cash.component';

@Component({
  selector: 'app-cash',
  templateUrl: './cash.component.html',
  styleUrls: ['./cash.component.scss']
})
export class CashComponent implements OnInit {

  constructor(private customerService: CustomerService,
    private bankService: BankService, private branchService: BranchService,
    private accountService: AccountService,
    private modalService: NgbModal, private cashService: CashService) {
    try {
      const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
      const permission = userInfo?.permission;
      this.permission.canEdit = permission?.edit_permission?.includes('customer');
      this.permission.canDelete = permission?.delete_permission?.includes('customer');
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
  accountOptions: DDL[] = [];
  bankOptions: DDL[] = [];
  branchOptions: DDL[] = [];
  form: CashForm = new CashForm();
  today: Date = new Date();
  error = {
    amount: false,
    transfer_date_from: false,
    transfer_date_to: false
  };
  fields: string[] = [
    'No.',
    'Account No.',
    'Customer Name',
    'Bank Name',
    'Amount',
    'Transfer Date'
  ];
  items: CashItem[] = [];
  page: number = 0;
  total: number = 0;
  limit: number = 10;
  is_search = false;
  submitted = false;
  permission = {
    canEdit: false,
    canDelete: false
  }

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
    await this.getBranchDDL(bank_id);
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

  numberFormat(num: string) {
    return num && !isNaN(+num) ? numeral(num).format('0,0.00') : '-';
  }

  dateFormat(date: any) {
    return date ? moment(date).format('DD/MM/YYYY HH:mm:ss') : '-';
  }

  mapName(name, lastname) {
    return name ? lastname ? `${name} ${lastname}` : name : lastname ? lastname : '-';
  }

  pagination(page: number) {
    this.page = page;
    this.searchBtn();
  }

  validate() {
    this.submitted = true;
    let valid = true;
    if (this.form.amount && isNaN(+this.form.amount)) {
      this.error.amount = true;
      valid = false;
    }
    if (this.form.transfer_date_from && this.form.transfer_date_to && moment(this.form.transfer_date_from).isAfter(moment(this.form.transfer_date_to))) {
      this.error.transfer_date_from = true;
      this.error.transfer_date_to = true;
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
      if (this.form.account_id) req.account_id = this.form.account_id;
      if (this.form.customer_id) req.customer_id = this.form.customer_id;
      if (this.form.bank_id) req.bank_id = this.form.bank_id;
      if (this.form.branch_id) req.branch_id = this.form.branch_id;
      if (this.form.transfer_date_from) req.transfer_date_from = this.form.transfer_date_from;
      if (this.form.transfer_date_to) req.transfer_date_to = this.form.transfer_date_to;
      if (this.form.amount) req.amount = this.form.amount;
      let res;
      if (!isEmpty(req)) {
        res = await this.cashService.searchTransfer(req, skip);
      } else {
        res = await this.cashService.findTransfer(skip);
      }
      this.setTableItems(res?.data?.data);
      this.total = res?.data.total;
    } catch (e) {
      if (e.response.data.code === 401) {
        sessionStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(e.response.data.message);
    }
  }

  setTableItems(data: any[]) {
    if (!Array.isArray(data) || data.length < 1) return;
    this.items = [];
    data.forEach((e, i) => {
      this.items.push({
        no: (i + 1) + (this.page * this.limit),
        account_id: e?.account?.account_id,
        account_no: e?.account?.account_no,
        customer_id: e?.customer?.customer_id,
        customer_name: e?.customer?.name,
        customer_lastname: e?.customer?.lastname,
        bank_id: e?.bank?.bank_id,
        bank_name: e?.bank?.bank_name,
        branch_id: e?.branch?.branch_id,
        branch_name: e?.branch?.branch_name,
        amount: e?.amount,
        transfer_date: e?.transfer_date
      });
    });
  }

  showModalAdd() {
    const modalRef = this.modalService.open(ModalAddCashComponent, { size: 'lg', centered: true, backdrop: 'static' });
    modalRef.componentInstance.customerOptions = this.customerOptions;
    modalRef.componentInstance.bankOptions = this.bankOptions;
    modalRef.result.then(() => {
      this.form = new CashForm();
      this.searchBtn();
    });
  }

  clearBtn() {
    this.is_search = false;
    this.submitted = false;
    this.form = new CashForm();
    this.error = {
      amount: false,
      transfer_date_from: false,
      transfer_date_to: false
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
