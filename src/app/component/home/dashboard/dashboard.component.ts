import { Component, OnInit } from '@angular/core';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import Swal from 'sweetalert2';
import { DashboardData } from './dashboard';
import numeral from 'numeral';
import * as moment from 'moment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss', './material-dashboard.min.css']
})
export class DashboardComponent implements OnInit {

  constructor(private dashboardService: DashboardService) {
    this.initData();
  }

  form: DashboardData = new DashboardData();

  ngOnInit(): void {
    window.setInterval(() => this.form.current_date = moment().format('MMMM Do YYYY HH:mm:ss'), 1000);
  }

  async initData() {
    try {
      const res = await this.dashboardService.findDashboard();
      if (res && res.data) {
        const data = res.data;
        if (data.count && Array.isArray(data.count) && data.count.length > 0) {
          this.form.expected = data.count[0].expected;
          this.form.actual = data.count[0].actual;
          this.form.min = data.count[0].min;
          this.form.max = data.count[0].max;
        }
        if (data.due && Array.isArray(data.due) && data.due.length > 0) {
          this.form.due = [];
          data.due.forEach(e => {
            this.form.due.push({
              customer_id: e?.customer_id,
              name: e?.name,
              lastname: e?.lastname,
              due_date: e?.due_date,
              expect_amount: e?.expect_amount,
              actual_amount: e?.actual_amount,
              overdue: (+e?.expect_amount) - ((+e?.actual_amount) || 0),
              pass_due_date: moment().diff(moment(e?.due_date), 'days') + ''
            })
          });
        }
      }
    } catch (e) {
      const status = e?.response?.data?.code;
      if (status === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e?.response?.data?.message || e
      });
    }
  }

  numberFormat(num: string) {
    return num && !isNaN(+num) ? numeral(num).format('0,0.00') : '-';
  }

  dateFormat(date: any, withTime = true) {
    return date ? moment(date).format('DD/MM/YYYY' + (withTime ? ' HH:mm:ss' : '')) : '-';
  }

  mapName(name, lastname) {
    return name ? lastname ? `${name} ${lastname}` : name : lastname ? lastname : '-';
  }

}
