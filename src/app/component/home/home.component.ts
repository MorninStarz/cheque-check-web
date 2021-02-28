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
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (isEmpty(this.userInfo) || !this.userInfo.token) {
      localStorage.clear();
      this.router.navigate(['']);
      return;
    }
    this.permission = this.userInfo.permission.view_permission;
    if (!this.permission.includes('dashboard')) {
      if (this.permission.includes('cheque')) {
        this.active = this.types.cheque;
      } else if (this.permission.includes('transfer')) {
        this.active = this.types.transfer;
      } else if (this.permission.includes('financial')) {
        this.active = this.types.customer;
      } else if (this.permission.includes('bank')) {
        this.active = this.types.bank;
      } else if (this.permission.includes('customer')) {
        this.active = this.types.customer;
      } else {
        this.active = 0;
      }
    }
  }

  types = {
    dashboard: 1,
    cheque: 2,
    wait_cheque: 3,
    approve_cheque: 4,
    transfer: 5,
    transferred: 6,
    financial: 7,
    financial_memo: 8,
    bank: 9,
    customer: 10
  };
  userInfo: any;
  permission: Array<string>;
  active: number = 1;

  ngOnInit(): void {}

  async logout() {
    await this.loginService.logout(this.userInfo.user_id);
    await localStorage.clear();
    this.router.navigate(['']);
  }

  menuLink(type) {
    this.active = type;
  }

}
