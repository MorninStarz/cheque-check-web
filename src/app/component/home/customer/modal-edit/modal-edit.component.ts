import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from 'src/app/services/customer/customer.service';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { CustomerTable } from '../customer';
import { ModalEditForm } from './modal-edit';

@Component({
  selector: 'app-modal-edit',
  templateUrl: './modal-edit.component.html',
  styleUrls: ['./modal-edit.component.scss']
})
export class ModalEditComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private customerService: CustomerService, 
    private router: Router) { 
    
  }

  @Input() customer: CustomerTable;

  form: ModalEditForm = new ModalEditForm();
  submitted = false;

  ngOnInit(): void { 
    this.initData();
  }

  async initData() {
    try {
      this.form.name = this.customer.name;
    } catch (e) {
      if (e.status === 401) {
        this.router.navigate(['/']);
        return;
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e.response.data.message
      });
    }
  }

  validate() {
    this.submitted = true;
    let valid = true;
    if (!this.form.name) valid = false;
    return valid;
  }

  saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'Edit Customer',
      text: 'Are you sure to Edit Customer ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          let req: any = {};
          if (this.form.name) req.name = this.form.name;
          if (_.isEmpty(req)) {
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Customer has successfully edited',
              allowEscapeKey: false,
              allowOutsideClick: false
            }).then(() => {
              this.closeBtn();
            });
          }
          const customer_id = _.get(this.customer, 'customer_id');
          await this.customerService.editCustomer(customer_id, req);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Customer has successfully edited',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.closeBtn();
          });
        } catch (e) {
          if (e.status === 401) {
            this.router.navigate(['/']);
            return;
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: e.response.data.message
          });
        }
      }
    });
  }

  closeBtn() {
    this.form = new ModalEditForm();
    this.submitted = false;
    this.activeModal.close();
  }

}
