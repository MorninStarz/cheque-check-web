import { Component, OnInit } from '@angular/core';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { ChequeForm, ChequeItem, DDL } from './cheque';
import { isEmpty } from '../../../../main';
import * as moment from 'moment';
import numeral from 'numeral';
import Swal from 'sweetalert2';
import { BankService } from 'src/app/services/bank/bank.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { ChequeService } from 'src/app/services/cheque/cheque.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAddChequeComponent } from './modal-add-cheque/modal-add-cheque.component';
import { ModalEditChequeComponent } from './modal-edit-cheque/modal-edit-cheque.component';

@Component({
  selector: 'app-cheque',
  templateUrl: './cheque.component.html',
  styleUrls: ['./cheque.component.scss']
})
export class ChequeComponent implements OnInit {

  constructor(private customerService: CustomerService,
    private bankService: BankService, private branchService: BranchService,
    private chequeService: ChequeService, private modalService: NgbModal) {
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
  bankOptions: DDL[] = [];
  branchOptions: DDL[] = [];
  statusOptions: DDL[] = [
    { value: 'Waiting', text: 'Waiting' },
    { value: 'Pending', text: 'Pending' },
    { value: 'Approved', text: 'Approved' }
  ]
  form: ChequeForm = new ChequeForm();
  today: Date = new Date();
  error = {
    cheque_no: false,
    pending_date_from: false,
    pending_date_to: false,
    approve_date_from: false,
    approve_date_to: false,
    amount: false
  }
  fields: Array<string> = [
    'No.',
    'Cheque No.',
    'Customer Name',
    'Bank/Branch',
    'Month',
    'Amount',
    'Pending Date',
    'Approve Date',
    'Remark',
    'Status'
  ];
  items: Array<ChequeItem> = [];
  page: number = 0;
  total: number = 0;
  limit: number = 10;
  is_search = false;
  submitted = false;
  permission = {
    canEdit: false,
    canDelete: false
  }

  ngOnInit(): void { }

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
    if (this.form.cheque_no && isNaN(+this.form.cheque_no)) {
      this.error.cheque_no = true;
      valid = false;
    }
    if (this.form.amount && isNaN(+this.form.amount)) {
      this.error.amount = true;
      valid = false;
    }
    if (this.form.pending_date_from && this.form.pending_date_to && moment(this.form.pending_date_from).isAfter(moment(this.form.pending_date_to))) {
      this.error.pending_date_from = true;
      this.error.pending_date_to = true;
      valid = false;
    }
    if (this.form.approve_date_from && this.form.approve_date_to && moment(this.form.approve_date_from).isAfter(moment(this.form.approve_date_to))) {
      this.error.approve_date_from = true;
      this.error.approve_date_to = true;
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
      if (this.form.cheque_no) req.cheque_no = this.form.cheque_no;
      if (this.form.customer_id) req.customer_id = this.form.customer_id;
      if (this.form.bank_id) req.bank_id = this.form.bank_id;
      if (this.form.branch_id) req.branch_id = this.form.branch_id;
      if (this.form.pending_date_from) req.pending_date_from = this.form.pending_date_from;
      if (this.form.pending_date_to) req.pending_date_to = this.form.pending_date_to;
      if (this.form.approve_date_from) req.approve_date_from = this.form.approve_date_from;
      if (this.form.approve_date_to) req.approve_date_to = this.form.approve_date_to;
      if (this.form.amount) req.amount = this.form.amount;
      if (this.form.status) req.status = this.form.status;
      let res;
      if (!isEmpty(req)) {
        res = await this.chequeService.searchCheque(req, skip);
      } else {
        res = await this.chequeService.findCheque(skip);
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

  showModalAdd() {
    const modalRef = this.modalService.open(ModalAddChequeComponent, { size: 'lg', centered: true, backdrop: 'static' });
    modalRef.componentInstance.customerOptions = this.customerOptions;
    modalRef.componentInstance.bankOptions = this.bankOptions;
    modalRef.result.then(() => {
      this.form = new ChequeForm();
      this.searchBtn();
    });
  }

  async showModalEdit(i: number) {
    const cheque_id = this.items[i].cheque_id;
    const res = await this.chequeService.getCheque(cheque_id);
    const modalRef = this.modalService.open(ModalEditChequeComponent, { size: 'lg', centered: true, backdrop: 'static' });
    modalRef.componentInstance.cheque = res?.data;
    modalRef.componentInstance.customerOptions = this.customerOptions;
    modalRef.componentInstance.bankOptions = this.bankOptions;
    modalRef.result.then(() => {
      this.form = new ChequeForm();
      this.searchBtn();
    });
  }

  async deleteCustomer(i: number) {
    try {
      Swal.fire({
        icon: 'question',
        title: 'Delete Cheque',
        text: 'Are you sure to Delete Cheque ?',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        reverseButtons: true
      }).then(async (res) => {
        if (res.isConfirmed) {
          const cheque_id = this.items[i].cheque_id;
          await this.chequeService.deleteCheque(cheque_id);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Cheque has successfully deleted',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.clearBtn();
            this.searchBtn();
          });
        }
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

  setTableItems(data: Array<any>) {
    this.items = [];
    if (isEmpty(data)) return;
    data.forEach((e, i) => {
      console.log(e);
      this.items.push({
        no: (i + 1) + (this.page * this.limit),
        cheque_id: e?.cheque_id,
        cheque_no: e?.cheque_no,
        customer_name: e?.customer.name,
        customer_lastname: e?.customer.lastname,
        bank_name: e?.bank.bank_name,
        branch_name: e?.branch.branch_name,
        month: e?.month,
        amount: e?.amount,
        pending_date: e?.pending_date,
        approve_date: e?.approve_date,
        remark: e?.remark,
        status: e?.status
      })
    });
  }

  clearBtn() {
    this.is_search = false;
    this.submitted = false;
    this.form = new ChequeForm();
    this.error = {
      cheque_no: false,
      pending_date_from: false,
      pending_date_to: false,
      approve_date_from: false,
      approve_date_to: false,
      amount: false
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
