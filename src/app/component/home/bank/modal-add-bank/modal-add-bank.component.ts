import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BankService } from 'src/app/services/bank/bank.service';
import { AddBankForm, BranchForm } from './modal-add-bank';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-add',
  templateUrl: './modal-add-bank.component.html',
  styleUrls: ['./modal-add-bank.component.scss']
})
export class ModalAddBankComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private bankService: BankService) { }

  submitted = false;
  form: AddBankForm = new AddBankForm();

  ngOnInit(): void {

  }

  add() {
    this.form.branches.push(new BranchForm());
  }

  remove(i: number) {
    this.form.branches.splice(i, 1);
  }
  
  validate() {
    this.submitted = true;
    let valid = true;
    if (!this.form.bank_name) valid = false;
    if (this.form.branches.some((e) => !e.branch_name)) valid = false;
    return valid;
  }

  saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'Add Bank',
      text: 'Are you sure to Add Bank ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await this.bankService.addBank(this.form);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Bank has successfully created',
            allowEscapeKey: false,
            allowOutsideClick: false
          }).then(() => {
            this.closeBtn();
          });
        } catch (e) {
          if (e.response.data.code === 401) {
            sessionStorage.clear();
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
    this.form = new AddBankForm();
    this.submitted = false;
    this.activeModal.close();
  }

}
