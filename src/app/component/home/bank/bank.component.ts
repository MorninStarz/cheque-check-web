import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BankForm, BankItem } from './bank';
import { BankService } from 'src/app/services/bank/bank.service';
import { ModalAddBankComponent } from './modal-add-bank/modal-add-bank.component';
import { ModalViewBankComponent } from './modal-view-bank/modal-view-bank.component';
import { ModalEditBankComponent } from './modal-edit-bank/modal-edit-bank.component';

@Component({
  selector: 'app-bank',
  templateUrl: './bank.component.html',
  styleUrls: ['./bank.component.scss']
})
export class BankComponent implements OnInit {

  constructor(private bankService: BankService, private modalService: NgbModal, private router: Router) { }

  form: BankForm = new BankForm();
  fields: Array<string> = [
    'เลขที่',
    'ธนาคาร',
    'สร้างโดย',
    'แก้ไขโดย'
  ];
  items: Array<BankItem> = [];
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
    this.permission.canEdit = permission?.edit_permission?.includes('bank');
    this.permission.canDelete = permission?.delete_permission?.includes('bank');
  }

  pagination(i: number) {
    this.page = i;

  }

  async searchBtn() {
    try {
      const skip = this.page * this.limit;
      const res = await this.bankService.searchBank(this.form, skip);
      if (res && res.data) {
        this.items = [];
        const data = res?.data?.data;
        data.forEach((e, i) => {
          this.items.push({
            no: (i + 1) + (this.page * this.limit),
            bank_id: e?.bank_id,
            bank_name: e?.bank_name,
            branches: e?.branch,
            create_by: e?.create_by,
            update_by: e?.update_by
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
      this.errorMsg(e?.response?.data?.message || e);
    }
    this.is_search = true;
  }

  showModalAdd() {
    this.modalService.open(ModalAddBankComponent, { size: 'lg', centered: true, backdrop: 'static' }).result.then(() => {
      this.form = new BankForm();
      this.searchBtn();
    });
  }

  async showModalView(i: number) {
    try {
      const modalRef = this.modalService.open(ModalViewBankComponent, { size: 'lg', centered: true, backdrop: 'static' });
      modalRef.componentInstance.bank = this.items[i];
      modalRef.result.then(() => {
        this.form = new BankForm();
        this.searchBtn();
      });
    } catch (e) {
      const status = e?.response?.data?.code;
      if (status === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(e.message);
    }
  }

  async showModalEdit(i: number) {
    try {
      const res = await this.bankService.getBank(this.items[i].bank_id);
      const modalRef = this.modalService.open(ModalEditBankComponent, { size: 'lg', centered: true, backdrop: 'static' });
      modalRef.componentInstance.bank = res;
      modalRef.result.then(() => {
        this.form = new BankForm();
        this.searchBtn();
      });
    } catch (e) {
      const status = e?.response?.data?.code;
      if (status === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(e.message);
    }
  }

  clearBtn() {
    this.is_search = false;
    this.form = new BankForm();
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
