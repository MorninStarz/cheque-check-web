import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login/login.service';
import { isEmpty } from '../../../main';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private router: Router, private loginService: LoginService) {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (isEmpty(this.userInfo) || !this.userInfo.token) {
      sessionStorage.clear();
      this.router.navigate(['']);
      return;
    }
    this.permission = this.userInfo.permission.view_permission;
    if (!this.permission.includes('dashboard')) {
      if (this.permission.includes('cheque')) {
        this.active = this.types.cheque;
      } else if (this.permission.includes('bank')) {
        this.active = this.types.bank;
      } else if (this.permission.includes('customer')) {
        this.active = this.types.customer;
      } else if (this.permission.includes('transaction')) {
        this.active = this.types.transaction;
      } else if (this.permission.includes('account')) {
        this.active = this.types.account;
      } else if (this.permission.includes('transfer')) {
        this.active = this.types.cash;
      } else {
        this.active = 0;
      }
    }
  }

  types = {
    dashboard: 1,
    cheque: 2,
    bank: 3,
    customer: 4,
    transaction: 5,
    account: 6,
    cash: 7
  }
  userInfo: any;
  permission: Array<string>;
  active: number = 1;

  ngOnInit(): void {}

  async logout() {
    await this.loginService.logout(this.userInfo.user_id);
    await sessionStorage.clear();
    this.router.navigate(['']);
  }

  menuLink(type) {
    this.active = type;
  }

}
