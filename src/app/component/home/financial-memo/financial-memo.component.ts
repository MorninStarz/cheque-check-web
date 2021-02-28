import { Component, OnInit } from '@angular/core';
import { CustomerService } from 'src/app/services/customer/customer.service';
import Swal from 'sweetalert2';
import * as numeral from 'numeral';
import * as moment from 'moment';
import { DDL } from '../cheque/cheque';
import { FinancialMemoForm, FinancialMemoItem } from './financial-memo';
import { isEmpty } from 'src/main';
import { FinancialService } from 'src/app/services/financial/financial.service';

@Component({
  selector: 'app-financial-memo',
  templateUrl: './financial-memo.component.html',
  styleUrls: ['./financial-memo.component.scss']
})
export class FinancialMemoComponent implements OnInit {

  constructor(private customerService: CustomerService, private financialService: FinancialService) {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const permission = userInfo?.permission;
      this.permission.canEdit = permission?.edit_permission?.includes('financial');
      this.permission.canDelete = permission?.delete_permission?.includes('financial');
      this.getCustomerDDL();
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
    }
  }

  customerOptions: DDL[] = [];
  customerFilter: DDL[] = [];
  form: FinancialMemoForm = new FinancialMemoForm();
  fields: string[] = [
    'เลขที่',
    'ชื่อลูกค้า',
    'จำนวนเงิน',
    'เลขที่เช็ค',
    'วันที่หน้าเช็ค',
    'วันที่โอน',
    'ประเภท'
  ];
  items: FinancialMemoItem[] = [];
  error = {
    customer_id: false,
    pending_date_from: false,
    pending_date_to: false
  };
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
            text: e?.name
          });
        });
        this.customerFilter = [...this.customerOptions];
      }
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
    }
  }

  onChangeCustomer() {
    this.error.customer_id = false;
    this.customerFilter = this.customerOptions.filter(e => e.text.includes(this.form.customer_id));
  }

  numberFormat(num: string) {
    return num && !isNaN(+num) ? numeral(num).format('0,0.00') : '-';
  }

  dateFormat(date: any) {
    return date ? moment(date).format('DD/MM/YYYY') : '-';
  }

  dateTimeFormat(date: any) {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
  }

  pagination(page: number) {
    this.page = page;
    this.searchBtn();
  }

  validate() {
    this.clearError();
    this.submitted = true;
    let valid = true;
    if (this.form.customer_id) {
      const option = this.customerOptions.filter(e => e.text === this.form.customer_id);
      if (!option || !Array.isArray(option) || option.length <= 0) {
        this.error.customer_id = true;
        valid = false;
      }
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
      if (this.form.customer_id) req.customer_id = this.customerOptions.find(e => e.text === this.form.customer_id).value;
      if (this.form.pending_date_from) req.pending_date_from = this.form.pending_date_from;
      if (this.form.pending_date_to) req.pending_date_to = this.form.pending_date_to;
      let res = await this.financialService.searchFinancialMemo(req, skip);
      this.setTableItems(res?.data?.data);
      this.total = res?.data?.total;
    } catch (e) {
      if (e.response.data.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(e.response.data.message);
    }
  }

  setTableItems(data) {
    this.items = [];
    if (isEmpty(data)) return;
    data.forEach((e, i) => {
      this.items.push({
        no: (i + 1) + (this.page * this.limit),
        customer_name: e?.customer?.name,
        cheque_no: e?.cheque?.cheque_no,
        amount: e?.amount,
        pending_date: e?.cheque?.pending_date,
        transfer_date: e?.transfer?.transfer_date,
        type: e?.cheque_id ? 'เช็ค' : 'โอน'
      });
    });
  }

  clearError() {
    this.error = {
      customer_id: false,
      pending_date_from: false,
      pending_date_to: false
    };
  }

  clearBtn() {
    this.is_search = false;
    this.submitted = false;
    this.form = new FinancialMemoForm();
    this.clearError();
    this.total = 0;
  }

  errorMsg(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }

}
