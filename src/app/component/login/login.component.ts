import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login/login.service';
import Swal from 'sweetalert2';
import { LoginForm } from './login';
import { isEmpty } from '../../../main';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, private loginService: LoginService) { }

  form: LoginForm = new LoginForm();
  submitted = false;

  ngOnInit(): void {  
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (!isEmpty(userInfo) && userInfo.token) {
      this.router.navigate(['home']);
    }
  }

  validate() {
    this.submitted = true;
    let valid = true;
    if (!this.form.username) valid = false;
    if (!this.form.password) valid = false;
    return valid;
  }

  loginBtn() {
    if (!this.validate()) return;
    try {
      this.loginService.auhenticate(this.form).then(res => {
        if (res && res.data) {
          sessionStorage.setItem('userInfo', JSON.stringify(res.data));
          this.router.navigate(['home']);
        }
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e?.response?.data?.message
      });
    }
  }

}
