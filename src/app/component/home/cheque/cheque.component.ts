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
import { FormControl } from '@angular/forms';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const permission = userInfo?.permission;
      this.permission.canEdit = permission?.edit_permission?.includes('cheque');
      this.permission.canDelete = permission?.delete_permission?.includes('cheque');
      this.getCustomerDDL();
      this.getBankDDL();
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
    }
  }

  customer: FormControl = new FormControl();
  customerOptions: DDL[] = [];
  customerFilter: Observable<DDL[]>;
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
    customer_id: false,
    cheque_no: false,
    pending_date_from: false,
    pending_date_to: false,
    approve_date_from: false,
    approve_date_to: false,
    amount: false
  }
  fields: Array<string> = [
    'เลขที่',
    'เลขที่เช็ค',
    'ชื่อลูกค้า',
    'ธนาคาร/สาขา',
    'เดือน',
    'จำนวนเงิน',
    'วันที่หน้าเช็ค',
    'วันที่นำเช็คเข้า',
    'วันที่เช็คผ่าน',
    'สถานะ',
    'หมายเหตุ'
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

  ngOnInit(): void {
    this.customerFilter = this.customer.valueChanges.pipe(
      startWith(''),
      map(value => this.customerOptions.filter(option => option.text.includes(value)))
    );
  }

  async getCustomerDDL() {
    try {
      this.customerOptions = [];
      const res = await this.customerService.findCustomer();
      if (res && res.data) {
        res.data.forEach(e => {
          this.customerOptions.push({
            value: e?.customer_id,
            text: e?.name
          });
        });
      }
      this.customer.setValue('');
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        localStorage.clear();
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
    return date ? moment(date).format('DD/MM/YYYY') : '-';
  }

  pagination(page: number) {
    this.page = page;
    this.searchBtn();
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
    }
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
      if (this.form.amount) req.amount = this.form.amount;
      let res;
      if (!isEmpty(req)) {
        res = await this.chequeService.searchPendingCheque(req, skip);
      } else {
        res = await this.chequeService.findPendingCheque(skip);
      }
      this.setTableItems(res?.data?.data);
      this.total = res?.data.total;
    } catch (e) {
      if (e.response.data.code === 401) {
        localStorage.clear();
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
    const res = await this.chequeService.getPendingCheque(cheque_id);
    const modalRef = this.modalService.open(ModalEditChequeComponent, { size: 'lg', centered: true, backdrop: 'static' });
    modalRef.componentInstance.cheque = res?.data;
    modalRef.componentInstance.customerOptions = this.customerOptions;
    modalRef.componentInstance.bankOptions = this.bankOptions;
    modalRef.result.then(() => {
      this.form = new ChequeForm();
      this.searchBtn();
    });
  }

  setTableItems(data: Array<any>) {
    this.items = [];
    if (isEmpty(data)) return;
    data.forEach((e, i) => {
      this.items.push({
        no: (i + 1) + (this.page * this.limit),
        cheque_id: e?.cheque_id,
        cheque_no: e?.cheque_no,
        customer_name: e?.customer?.name,
        bank_name: e?.bank.bank_name,
        branch_name: e?.branch.branch_name,
        month: e?.month,
        amount: e?.amount,
        pending_date: e?.pending_date,
        approve_date: e?.approve_date,
        pass_date: e?.pass_date,
        remark: e?.remark,
        status: e?.status
      })
    });
  }

  mapStatus(status) {
    switch (status) {
      case 'Pending':
        return 'รอนำเช็คเข้า';
      case 'Approved':
        return 'นำเช็คเข้าแล้ว';
      case 'Pass':
        return 'เช็คผ่านแล้ว';
    }
  }

  clearError() {
    this.error = {
      customer_id: false,
      cheque_no: false,
      pending_date_from: false,
      pending_date_to: false,
      approve_date_from: false,
      approve_date_to: false,
      amount: false
    }
  }

  clearBtn() {
    this.is_search = false;
    this.submitted = false;
    this.form = new ChequeForm();
    this.clearError();
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
