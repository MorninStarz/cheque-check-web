import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BankService } from 'src/app/services/bank/bank.service';
import { BranchForm, EditBankForm } from './modal-edit-bank';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { isEmpty } from 'src/main';

@Component({
  selector: 'app-modal-edit-bank',
  templateUrl: './modal-edit-bank.component.html',
  styleUrls: ['./modal-edit-bank.component.scss']
})
export class ModalEditBankComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private bankService: BankService) { }

  @Input() bank: any;

  submitted = false;
  form: EditBankForm = new EditBankForm();
  addBranch: Array<BranchForm> = [];
  deleteBranch: Array<BranchForm> = [];
  showAdd = false;

  ngOnInit(): void {
    console.log(this.bank)
    this.form.bank_id = _.get(this.bank, 'data.bank_id');
    this.form.bank_name = _.get(this.bank, 'data.bank_name');
    const branches: any = _.get(this.bank, 'data.branches');
    this.form.branches = [];
    if (Array.isArray(branches)) {
      branches.forEach((e) => this.form.branches.push({ branch_id: _.get(e, 'branch_id'), branch_name: _.get(e, 'branch_name') }));
    } else if (!isEmpty(branches)) {
      this.form.branches.push({ ...branches });
    } 
    if (this.form.branches.length === 0) {
      this.showAdd = true;
    }
  }

  add() {
    this.form.branches.push(new BranchForm());
  }

  remove(i: number) {
    const del = this.form.branches.splice(i, 1);
    if (del[0].branch_id) this.deleteBranch.push(del[0]);
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
      title: 'แก้ไขข้อมูลธนาคาร',
      text: 'ต้องการแก้ไขข้อมูลธนาคารหรือไม่ ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          let req: any = {
            bank_id: this.form.bank_id,
            bank_name: this.form.bank_name,
          };
          if (!_.isEmpty(this.form.branches)) {
            req.add_branch = [...this.form.branches.filter((e) => !e.branch_id)];
            this.form.branches = this.form.branches.filter((e) => e.branch_id);
          }
          if (!_.isEmpty(this.deleteBranch)) {
            req.delete_branch = [...this.deleteBranch];
          }
          req.edit_branch = [...this.form.branches];
          await this.bankService.editBank(req);
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'แก้ไขข้อมูลธนาคารสำเร็จ',
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
            title: 'ผิดพลาด',
            text: e.response.data.message
          });
        }
      }
    });
  }

  closeBtn() {
    this.form = new EditBankForm();
    this.submitted = false;
    this.showAdd = false;
    this.activeModal.close();
  }

}
