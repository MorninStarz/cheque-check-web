import { Component, OnInit } from '@angular/core';
import { isEmpty } from 'src/main';
import Swal from 'sweetalert2';
import { WaitChequeForm, WaitChequeItem } from './waiting-cheque';
import * as moment from 'moment';
import * as numeral from 'numeral';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { BankService } from 'src/app/services/bank/bank.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { ChequeService } from 'src/app/services/cheque/cheque.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormControl } from '@angular/forms';
import { DDL } from '../cheque/cheque';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-waiting-cheque',
  templateUrl: './waiting-cheque.component.html',
  styleUrls: ['./waiting-cheque.component.scss']
})
export class WaitingChequeComponent implements OnInit {

  constructor(private customerService: CustomerService,
    private bankService: BankService, private branchService: BranchService,
    private chequeService: ChequeService,) {
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
  form: WaitChequeForm = new WaitChequeForm();
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
  fields: any[] = [
    { text: 'เลขที่เช็ค', sort: '' },
    { text: 'ชื่อลูกค้า', sort: 'name' },
    { text: 'ธนาคาร/สาขา', sort: '' },
    { text: 'เดือน', sort: '' },
    { text: 'จำนวนเงิน', sort: '' },
    { text: 'วันที่หน้าเช็ค', sort: 'date' },
    { text: 'หมายเหตุ', sort: '' },
    { text: 'วันที่นำเช็คเข้า', sort: '' }
  ];
  check_all = false;
  items: WaitChequeItem[] = [];
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

  sort(type) {
    // if (!type) return;
    // switch(type) {
    //   case 'name':
    //     this.items.sort((a, b) => a.customer_name - b.customer_name) 
    //     break;
    // }
  }

  numberFormat(num: string) {
    return num && !isNaN(+num) ? numeral(num).format('0,0.00') : '-';
  }

  dateFormat(date: any) {
    return date ? moment(date).format('DD/MM/YYYY') : '-';
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
        res = await this.chequeService.searchWaitingCheque(req);
      } else {
        res = await this.chequeService.findWaitingCheque();
      }
      this.setTableItems(res?.data);
    } catch (e) {
      if (e.response.data.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(e.response.data.message);
    }
  }

  setTableItems(data: any[]) {
    this.items = [];
    if (isEmpty(data)) return;
    data.forEach((e, i) => {
      this.items.push({
        is_error: false,
        is_check: false,
        is_edit: false,
        cheque_id: e?.cheque_id,
        cheque_no: e?.cheque_no,
        customer_name: e?.customer.name,
        bank_name: e?.bank.bank_name,
        branch_name: e?.branch.branch_name,
        month: e?.month,
        amount: e?.amount,
        pending_date: e?.pending_date,
        ​remark: e?.remark,
        approve_date: e?.approve_date
      })
    });
  }

  checkAll() {
    this.items.forEach(e => e.is_check = this.check_all);
  }

  onCheck() {
    this.check_all = this.items.every(e => e.is_check);
  } 

  confirmEdit(i: number) {
    try {
      if (!this.items[i].approve_date) {
        this.items[i].is_error = true;
        return;
      }
      Swal.fire({
        icon: 'question',
        title: 'ลงวันที่เข้าเช็ค',
        text: 'ยืนยันวันที่เข้าเช็ค ?',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            await this.chequeService.editWaitingCheque({
              cheque_id: this.items[i].cheque_id,
              approve_date: this.items[i].approve_date
            });
            Swal.fire({
              icon: 'success',
              title: 'สำเร็จ',
              text: 'บันทึกสำเร็จ',
              allowEscapeKey: false,
              allowOutsideClick: false
            }).then(() => {
              this.items.splice(i, 1);
            });
          } catch (error) {
            if (error.response.data.code === 401) {
              localStorage.clear();
              window.location.reload();
              return;
            }
            this.errorMsg(error.response.data.message);
          }
        }
      });
    } catch (error) {
      if (error.response.data.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(error.response.data.message);
    }
  }

  cancelEdit(item: WaitChequeItem) {
    item.approve_date = null;
    item.is_edit = false;
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
    this.form = new WaitChequeForm();
    this.clearError();
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
