import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewBankForm } from './modal-view-bank';
import * as _ from 'lodash';

@Component({
  selector: 'app-modal-view-bank',
  templateUrl: './modal-view-bank.component.html',
  styleUrls: ['./modal-view-bank.component.scss']
})
export class ModalViewBankComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) {
  }

  @Input() bank: any;
  form: ViewBankForm = new ViewBankForm();

  ngOnInit(): void {
    this.form.bank_name = _.get(this.bank, 'data.bank_name');
    const branches: Array<any> = _.get(this.bank, 'data.branches');
    this.form.branches = [];
    branches.forEach((e) => this.form.branches.push({ branch_name: _.get(e, 'branch_name') }));
  }

  closeBtn() {
    this.form = new ViewBankForm();
    this.activeModal.close();
  }

}
