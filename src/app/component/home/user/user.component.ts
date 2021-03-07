import { Component, OnInit } from '@angular/core';
import { UserForm, UserItem } from './user';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  constructor() { }

  form: UserForm = new UserForm();
  fields: string[] = [
    'เลขที่',
    'ชื่อผู้ใช้',
    'กลุ่ม'
  ];
  items: UserItem[] = [];

  ngOnInit(): void {
  }

}
