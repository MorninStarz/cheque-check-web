import { Component, OnInit } from '@angular/core';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { DDL } from '../cheque/cheque';
import * as numeral from 'numeral';
import { FinancialForm, FinancialItem } from './financial';
import Swal from 'sweetalert2';
import { isEmpty } from 'src/main';

@Component({
  selector: 'app-financial',
  templateUrl: './financial.component.html',
  styleUrls: ['./financial.component.scss']
})
export class FinancialComponent implements OnInit {

  constructor(private customerService: CustomerService) {
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
  form: FinancialForm = new FinancialForm();
  error = {
    customer_id: false
  };
  fields: string[] = [
    'เลขที่',
    'ชื่อลูกค้า',
    'ยอดเงินรวม',
    'ชำระแล้ว',
    'คงเหลือ'
  ];
  items: FinancialItem[] = [];
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
    return num && !isNaN(+num) ? numeral(num).format('0,0.00') : '0';
  }

  pagination(page: number) {
    this.page = page;
    this.searchBtn();
  }

  validate() {
    this.submitted = true;
    let valid = true;
    if (this.form.customer_id) {
      const option = this.customerOptions.filter(e => e.text === this.form.customer_id);
      if (!option || !Array.isArray(option) || option.length <= 0) {
        this.error.customer_id = true;
        valid = false;
      }
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
      const res = await this.customerService.searchFinancialCustomer(req, skip);
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

  setTableItems(data) {
    if (isEmpty(data)) return;
    this.items = [];
    data.forEach((e, i) => {
      this.items.push({
        no: (i + 1) + (this.page * this.limit),
        customer_name: e?.name,
        expect_amount: e?.expect_amount,
        actual_amount: e?.actual_amount,
        balance: +e?.expect_amount - (+e?.actual_amount)
      });
    });
  }

  clearError() {
    this.error = {
      customer_id: false
    }
  }

  clearBtn() {
    this.is_search = false;
    this.submitted = false;
    this.form = new FinancialForm();
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
