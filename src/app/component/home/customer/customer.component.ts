import { Component, OnInit } from '@angular/core';
import { CustomerForm, CustomerTable } from './customer';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { CustomerService } from '../../../services/customer/customer.service';
import * as _ from 'lodash';
import * as numeral from 'numeral';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAddComponent } from './modal-add/modal-add.component';
import { ModalEditForm } from './modal-edit/modal-edit';
import { ModalEditComponent } from './modal-edit/modal-edit.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit {

  constructor(private customerService: CustomerService, 
    private modalService: NgbModal) { }

  form: CustomerForm = new CustomerForm();
  fields: Array<string> = [
    'ลำดับ',
    'ชื่อ',
    'สร้างโดย',
    'แก้ไขโดย'
  ];
  error = {
    mobile_no: false,
    start_date: false,
    end_date: false
  };
  today: Date = new Date();
  items: Array<CustomerTable> = [];
  page: number = 0;
  total: number = 0;
  limit: number = 10;
  is_search = false;
  permission = {
    canEdit: false,
    canDelete: false
  }

  ngOnInit(): void {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    const permission = _.get(userInfo, 'permission');
    this.permission.canEdit = permission?.edit_permission?.includes('customer');
    this.permission.canDelete = permission?.delete_permission?.includes('customer');
  }

  pagination(page: number) {
    this.page = page;
    this.searchBtn();
  }

  async searchBtn() {
    try {
      const skip = this.page * this.limit;
      const res = await this.customerService.searchCustomer(this.form, skip);
      if (res && res.data) {
        this.items = [];
        const data = res?.data?.data;
        data.forEach((e, i) => {
          this.items.push({
            no: (i + 1) + (this.page * this.limit),
            customer_id: _.get(e, 'customer_id'),
            name: _.get(e, 'name'),
            create_by: _.get(e, 'create_by'),
            update_by: _.get(e, 'update_by')
          });
        });
        this.total = res?.data?.total;
      } else {
        const status = res?.status;
        if (status === 401) {
          localStorage.clear();
          window.location.reload();
          return;
        }
        this.errorMsg(res.data);
      }
    } catch (e) {
      const status = e?.response?.data?.code;
      if (status === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(e.message);
    }
    this.is_search = true;
  }

  clearBtn() {
    this.is_search = false;
    this.form = new CustomerForm();
    this.total = 0;
  }

  numberFormat(num: string) {
    return num && !isNaN(+num) ? numeral(num).format('0,0.00') : '-';
  }

  dateFormat(date: any) {
    return date ? moment(date).format('DD/MM/YYYY HH:mm:ss') : '-';
  }

  showModalAdd() {
    this.modalService.open(ModalAddComponent, { size: 'lg', centered: true, backdrop: 'static' }).result.then(() => {
      this.form = new CustomerForm();
      this.searchBtn();
    });
  }

  showModalEdit(i: number) {
    const modalRef = this.modalService.open(ModalEditComponent, { size: 'lg', centered: true, backdrop: 'static' });
    modalRef.componentInstance.customer = this.items[i];
    modalRef.result.then(() => {
      this.form = new CustomerForm();
      this.searchBtn();
    });
  }

  errorMsg(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }

}
