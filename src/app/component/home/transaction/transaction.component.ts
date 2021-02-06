import { Component, OnInit } from '@angular/core';
import { DDL } from '../cheque/cheque';
import { TransactionForm, TransactionTable } from './transaction';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  constructor() { }

  page: number = 0;
  total: number = 0;
  limit: number = 10;
  is_search = false;
  submitted = false;
  customerOptions: DDL[] = [];
  bankOptions: DDL[] = [];
  branchOptions: DDL[] = [];
  statusOptions: DDL[] = [
    { value: 'Waiting', text: 'Waiting' },
    { value: 'Pending', text: 'Pending' },
    { value: 'Approved', text: 'Approved' }
  ]
  form: TransactionForm = new TransactionForm();
  today: Date = new Date();
  fields: Array<string> = [
    'No.',
    'Cheque No.',
    'Customer Name',
    'Account No.',
    'Remark',
    'Amount',
    'Cheque Status',
    'Date-Time'
  ]
  items: Array<TransactionTable> = [];
  error = {
    cheque_no: false,
    amount: false,
    date_from: false,
    date_to: false
  }

  ngOnInit(): void {
  }

  clearBtn() {
    this.is_search = false;
  }

  searchBtn() {
    this.is_search = true;
  }

}
