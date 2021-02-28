import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as numeral from 'numeral';
import * as moment from 'moment';
import { BankService } from 'src/app/services/bank/bank.service';
import { BranchService } from 'src/app/services/branch/branch.service';
import { ChequeService } from 'src/app/services/cheque/cheque.service';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { isEmpty } from 'src/main';
import Swal from 'sweetalert2';
import { DDL } from '../cheque/cheque';
import { ApproveChequeForm, ApproveChequeItem } from './approve-cheque';

@Component({
  selector: 'app-approve-cheque',
  templateUrl: './approve-cheque.component.html',
  styleUrls: ['./approve-cheque.component.scss']
})
export class ApproveChequeComponent implements OnInit {

  constructor(private customerService: CustomerService,
    private bankService: BankService, private branchService: BranchService,
    private chequeService: ChequeService) {
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
  form: ApproveChequeForm = new ApproveChequeForm();
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
    'เลขที่เช็ค',
    'ชื่อลูกค้า',
    'ธนาคาร/สาขา',
    'เดือน',
    'จำนวนเงิน',
    'วันที่หน้าเช็ค',
    'วันที่นำเช็คเข้า',
    'วันที่เช็คผ่าน',
    'หมายเหตุ'
  ];
  check_all = false;
  items: ApproveChequeItem[] = [];
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
        res = await this.chequeService.searchApproveCheque(req);
      } else {
        res = await this.chequeService.findApproveCheque();
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
        is_date_error: false,
        is_remark_error: false,
        is_edit: false,
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
        remark: e?.remark
      })
    });
  }

  approveCheque(i: number) {
    try {
      this.items[i].is_remark_error = false;
      if (!this.items[i].pass_date) {
        this.items[i].is_date_error = true;
        return;
      }
      Swal.fire({
        icon: 'question',
        title: 'เช็คผ่าน',
        text: 'ยืนยันสถานะเช็คผ่าน ?',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            await this.chequeService.editApproveCheque({
              cheque_id: this.items[i].cheque_id,
              is_pass: true,
              pass_date: this.items[i].pass_date
            });
            this.items[i].is_edit = false;
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
            if (error?.response?.data?.code === 401) {
              localStorage.clear();
              window.location.reload();
              return;
            }
            this.errorMsg(error?.response?.data?.message || error);
          }
        }
      });
    } catch (error) {
      if (error?.response?.data?.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(error?.response?.data?.message || error);
    }
  }

  rejectCheque(i: number) {
    try {
      this.items[i].is_date_error = false;
      if (!this.items[i].remark) {
        this.items[i].is_remark_error = true;
        return;
      }
      Swal.fire({
        icon: 'question',
        title: 'เช็คตีกลับ',
        text: 'ยืนยันสถานะเช็คตีกลับ ?',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'ตกลง',
        cancelButtonText: 'ยกเลิก',
        reverseButtons: true
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            await this.chequeService.editApproveCheque({
              cheque_id: this.items[i].cheque_id,
              is_pass: false,
              remark: this.items[i].remark
            });
            this.items[i].is_edit = false;
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
            if (error?.response?.data?.code === 401) {
              localStorage.clear();
              window.location.reload();
              return;
            }
            this.errorMsg(error?.response?.data?.message || error);
          }
        }
      });
    } catch (error) {
      if (error?.response?.data?.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(error?.response?.data?.message || error);
    }
  }

  cancelEdit(item: ApproveChequeItem) {
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
    this.form = new ApproveChequeForm();
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
