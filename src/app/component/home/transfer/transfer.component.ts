import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import * as numeral from 'numeral';
import * as moment from 'moment';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { DDL } from '../cheque/cheque';
import { TransferForm, TransferItem } from './transfer';
import { isEmpty } from 'src/main';
import { TransferService } from 'src/app/services/transfer/transfer.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalAddTransferComponent } from './modal-add-transfer/modal-add-transfer.component';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {

  constructor(private customerService: CustomerService,
    private transferService: TransferService, private modalService: NgbModal) {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const permission = userInfo?.permission;
      this.permission.canEdit = permission?.edit_permission?.includes('transfer');
      this.permission.canDelete = permission?.delete_permission?.includes('transfer');
      this.getCustomerDDL();
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
  form: TransferForm = new TransferForm();
  fields: string[] = [
    'เลขที่',
    'ชื่อลูกค้า',
    'จำนวนเงิน',
    'เวลาที่โอน'
  ];
  items: TransferItem[] = [];
  error = {
    customer_id: false,
    amount: false,
    transfer_date_from: false,
    transfer_date_to: false
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

  numberFormat(num: string) {
    return num && !isNaN(+num) ? numeral(num).format('0,0.00') : '-';
  }

  dateFormat(date: any) {
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
    if (this.customer.value) {
      const option = this.customerOptions.filter(e => e.text === this.customer.value);
      if (option && Array.isArray(option) && option.length > 0) this.form.customer_id = option[0].value;
      else {
        this.error.customer_id = true;
        valid = false;
      }
    }
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
      if (this.form.customer_id) req.customer_id = this.form.customer_id;
      if (this.form.transfer_date_from) req.transfer_date_from = this.form.transfer_date_from;
      if (this.form.transfer_date_to) req.transfer_date_to = this.form.transfer_date_to;
      if (this.form.amount) req.amount = this.form.amount;
      let res;
      if (!isEmpty(req)) {
        res = await this.transferService.searchTransfer(req, skip);
      } else {
        res = await this.transferService.findTransfer(skip);
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

  setTableItems(data) {
    if (isEmpty(data)) return;
    this.items = [];
    data.forEach((e, i) => {
      this.items.push({
        no: (i + 1) + (this.page * this.limit),
        transfer_id: e?.transfer_id,
        customer_name: e?.customer?.name,
        amount: e?.amount,
        transfer_date: e?.transfer_date
      })
    });
  }

  showModalAdd() {
    const modalRef = this.modalService.open(ModalAddTransferComponent, { size: 'lg', centered: true, backdrop: 'static' });
    modalRef.componentInstance.customerOptions = this.customerOptions;
    modalRef.result.then(() => {
      this.form = new TransferForm();
      this.searchBtn();
    });
  }

  clearError() {
    this.error = {
      customer_id: false,
      transfer_date_from: false,
      transfer_date_to: false,
      amount: false
    }
  }

  clearBtn() {
    this.is_search = false;
    this.submitted = false;
    this.form = new TransferForm();
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
