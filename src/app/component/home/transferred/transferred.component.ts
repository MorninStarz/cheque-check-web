import { Component, OnInit } from '@angular/core';
import * as numeral from 'numeral';
import * as moment from 'moment';
import { TransferService } from 'src/app/services/transfer/transfer.service';
import { isEmpty } from 'src/main';
import Swal from 'sweetalert2';
import { DDL } from '../cheque/cheque';
import { Transferred, TransferredItem, TransferredReq, TransferredUnmatchItem, TransferredSuccessItem } from './transferred';
import { CustomerService } from 'src/app/services/customer/customer.service';

@Component({
  selector: 'app-transferred',
  templateUrl: './transferred.component.html',
  styleUrls: ['./transferred.component.scss']
})
export class TransferredComponent implements OnInit {

  constructor(private transferService: TransferService, private customerService: CustomerService) {
    this.getCustomerDDL();
  }

  file: File;
  upload_state: '' | 'uploading' | 'uploaded' = '';
  fileContent: Transferred[] = [];
  fields: string[] = [
    'เลขที่',
    'จำนวนเงิน',
    'วันที่โอน',
    'ชื่อลูกค้า'
  ];
  unset_items: TransferredItem[] = [];
  unmatch_items: TransferredUnmatchItem[] = [];
  unmatch_ddl: DDL[][] = [];
  is_success = false;
  success_items: TransferredSuccessItem[] = [];
  // customer: FormControl[] = [];
  customerOptions: DDL[] = [];
  customerFilter: DDL[][] = [];
  error = {
    customer_id: false
  };


  ngOnInit(): void { }

  async getCustomerDDL() {
    try {
      this.customerOptions = [];
      const res = await this.customerService.findCustomer();
      if (res && res.data) {
        res.data.forEach(e => {
          this.customerOptions.push({
            value: e?.customer_id,
            text: e?.name
          });
        });
      }
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
    }
  }

  onChangeName(i: number) {
    this.unset_items[i].is_error = false;
    this.customerFilter[i] = this.customerOptions.filter(e => e.text.includes(this.unset_items[i].customer_id));
  }

  uploadFile(event: FileList) {
    this.file = event && event.length > 0 ? event.item(0) : null;
    if (event && event.length > 0) {
      // if (event.item(0).type !== 'text/csv') {
      //   Swal.fire({
      //     icon: 'error',
      //     title: 'ผิดพลาด',
      //     text: 'อัพโหลดไฟล์นามสกุล .csv เท่านั้น'
      //   }).then(() => this.file = null);
      // } else {
        this.file = event.item(0);
      // }
    }
  }

  async uploadBtn() {
    this.upload_state = 'uploading';
    try {
      const fileReader: FileReader = new FileReader();
      let fileStr: string;
      fileReader.onloadend = async _ => {
        try {
          fileStr = fileReader.result as string;
          const arr: string[] = fileStr.split('\n');
          let req: Transferred[] = [];
          for (let i = 1; i < arr.length; i++) {
            const data = arr[i].split(',');
            req.push({
              amount: data[0].trim(),
              transfer_date: data[1].trim()
            });
          }
          const res = await this.transferService.editTransfer(req);
          this.setItems(res?.data);
        } catch (e) {
          if (e?.response?.data?.code === 401) {
            localStorage.clear();
            window.location.reload();
            return;
          }
          this.errorMsg(e?.response?.data?.message || e);
          this.upload_state = '';
          this.file = null;
        }
      };
      fileReader.readAsText(this.file, 'utf-8');
    } catch (e) {
      if (e?.response?.data?.code === 401) {
        localStorage.clear();
        window.location.reload();
        return;
      }
      this.errorMsg(e?.response?.data?.message || e);
      this.upload_state = '';
      this.file = null;
    }
  }

  setItems(data) {
    if (isEmpty(data)) return;
    this.unset_items = [];
    data.unset.forEach((e, i) => {
      this.unset_items.push({
        is_error: false,
        no: i + 1,
        amount: e.amount,
        transfer_date: e.transfer_date,
        customer_id: ''
      });
      this.customerFilter.push([...this.customerOptions]);
    });
    this.unmatch_items = [];
    this.unmatch_ddl = [];
    data.unmatch.forEach((e, i) => {
      this.unmatch_items.push({
        is_error: false,
        no: this.unset_items.length + i + 1,
        amount: e.amount,
        transfer_date: e.transfer_date,
        customer_id: ''
      });
      const ddl: DDL[] = [];
      e.customer_ids.forEach(id => {
        ddl.push({
          value: id,
          text: this.customerOptions.find(c => c.value === id).text
        });
      });
      this.unmatch_ddl.push(ddl);
    });
    data.set.forEach((e, i) => {
      this.success_items.push({
        no: i + 1,
        amount: e.amount,
        transfer_date: e.transfer_date,
        customer_name: this.customerOptions.find(c => c.value === e.customer_id).text
      });
    })
    this.upload_state = 'uploaded';
  }

  pushItems(data) {
    if (isEmpty(data)) return;
    if (!this.unset_items) this.unset_items = [];
    data.forEach((e, i) => {
      this.success_items.push({
        no: i + 1,
        amount: e.amount,
        transfer_date: e.transfer_date,
        customer_name: this.customerOptions.find(c => c.value === e.customer_id).text
      });
    });
  }

  validate() {
    let valid = true;
    this.unset_items.forEach(e => {
      const customer = this.customerOptions.find(opt => opt.text === e.customer_id);
      if (!customer) {
        e.is_error = true;
        valid = false;
      }
    });
    return valid;
  }

  async saveBtn() {
    if (!this.validate()) return;
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันยอดเงินลูกค้า',
      text: 'ต้องการยืนยันยอดเงินลูกค้าหรือไม่ ?',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: 'ตกลง',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          const req: TransferredReq[] = [];
          this.unset_items.forEach(e => {
            req.push({
              amount: e.amount,
              transfer_date: e.transfer_date,
              customer_id: this.customerOptions.find(c => c.text === e.customer_id).value
            });
          });
          this.unmatch_items.forEach(e => {
            req.push({
              amount: e.amount,
              transfer_date: e.transfer_date,
              customer_id: e.customer_id
            });
          });
          const res = await this.transferService.editTransferUnset(req);
          this.pushItems(res?.data);
          this.is_success = true;
        } catch (error) {
          if (error.response.data.code === 401) {
            localStorage.clear();
            window.location.reload();
            return;
          }
          this.errorMsg(error.response.data.message);
        }
      }
    });
  }

  resetBtn() {
    this.unset_items = [];
    this.success_items = [];
    this.upload_state = '';
    this.file = null;
  }

  numberFormat(num: string) {
    return num && !isNaN(+num) ? numeral(num).format('0,0.00') : '-';
  }

  dateFormat(date: any) {
    return date ? moment(date).format('DD/MM/YYYY HH:mm') : '-';
  }

  errorMsg(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message
    });
  }

}
