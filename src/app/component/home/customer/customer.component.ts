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
    'No.',
    'Customer Name',
    'Mobile',
    'Expect Amount',
    'Actual Amount',
    'Due Date',
    'Create Date',
    'Update Date'
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
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    const permission = _.get(userInfo, 'permission');
    this.permission.canEdit = permission?.edit_permission?.includes('customer');
    this.permission.canDelete = permission?.delete_permission?.includes('customer');
  }

  validate() {
    let valid = true;
    this.error = {
      mobile_no: false,
      start_date: false,
      end_date: false
    }
    if (isNaN(+this.form.mobile)) {
      this.error.mobile_no = true;
      valid = false;
    }
    if (this.form.start_date && this.form.end_date) {
      if (moment(this.form.start_date).isAfter(moment(this.form.end_date))) {
        this.error.start_date = true;
        this.error.end_date = true;
        valid = false;
      }
    }
    return valid;
  }

  pagination(page: number) {
    this.page = page;
    this.searchBtn();
  }

  async searchBtn() {
    if (!this.validate()) {
      return;
    }
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
            lastname: _.get(e, 'lastname'),
            mobile: _.get(e, 'mobile'),
            expect: _.get(e, 'expect_amount'),
            actual: _.get(e, 'actual_amount'),
            due_date: _.get(e, 'due_date'),
            create_date: _.get(e, 'create_date'),
            update_date: _.get(e, 'update_date')
          });
        });
        this.total = res?.data?.total;
      } else {
        const status = res?.status;
        if (status === 401) {
          sessionStorage.clear();
          window.location.reload();
          return;
        }
        this.errorMsg(res.data);
      }
    } catch (e) {
      const status = e?.response?.data?.code;
      if (status === 401) {
        sessionStorage.clear();
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

  mapName(name: string, lastname: string) {
    let fullName = '';
    if (name) {
      fullName += name;
      if (lastname) {
        fullName += ' ' + lastname;
      }
    }
    if (!fullName) fullName = '-';
    return fullName;
  }

  async deleteCustomer(i: number) {
    Swal.fire({
      icon: 'question',
      title: 'Delete Customer',
      text: 'Are you sure to Delete Customer ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        const customer_id = _.get(this.items[i], 'customer_id');
        try {
          await this.customerService.deleteCustomer(customer_id);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Customer has successfully deleted',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.form = new CustomerForm();
            this.searchBtn();
          });
        } catch (e) {
          if (e.response.data.code === 401) {
            sessionStorage.clear();
            window.location.reload();
            return;
          }
          this.errorMsg(e.response.data.message);
        }
      }
    });
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
