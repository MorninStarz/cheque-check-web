import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewBankForm } from './modal-view-bank';
import * as _ from 'lodash';
import { BankItem } from '../bank';

@Component({
  selector: 'app-modal-view-bank',
  templateUrl: './modal-view-bank.component.html',
  styleUrls: ['./modal-view-bank.component.scss']
})
export class ModalViewBankComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal) {
  }

  @Input() bank: BankItem;
  form: ViewBankForm = new ViewBankForm();

  ngOnInit(): void {
    console.log(this.bank);
    this.form.bank_name = this.bank?.bank_name;
    const branches: any[] = this.bank?.branches;
    this.form.branches = [];
    branches.forEach((e) => this.form.branches.push({ branch_name: e?.branch_name }));
  }

  closeBtn() {
    this.form = new ViewBankForm();
    this.activeModal.close();
  }

}
