import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomerService } from 'src/app/services/customer/customer.service';
import Swal from 'sweetalert2';
import { ModalAddForm } from './modal-add';

@Component({
  selector: 'app-modal-add',
  templateUrl: './modal-add.component.html',
  styleUrls: ['./modal-add.component.scss']
})
export class ModalAddComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private customerService: CustomerService) { 
  }

  form: ModalAddForm = new ModalAddForm();
  submitted = false;

  ngOnInit(): void {
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
      title: 'Add Customer',
      text: 'Are you sure to Add Customer ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await this.customerService.createCustomer(this.form);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Customer has successfully created',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.closeBtn();
          });
          
        } catch (e) {
          if (e.response.data.code === 401) {
            localStorage.clear();
            window.location.reload();
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
    this.form = new ModalAddForm();
    this.submitted = false;
    this.activeModal.close();
  }

}
