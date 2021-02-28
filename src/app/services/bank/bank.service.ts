import { Injectable } from '@angular/core';
import { config } from '../../../environments/environment';
import * as _ from 'lodash';
import { BankForm } from 'src/app/component/home/bank/bank';
import { AddBankForm } from 'src/app/component/home/bank/modal-add-bank/modal-add-bank';
import { getAxios } from '../set-header';


@Injectable({
  providedIn: 'root'
})
export class BankService {

  userInfo = JSON.parse(localStorage.getItem('userInfo'));
  url: string;

  constructor() { 
    this.url = _.get(config, 'service.url');
  }

  public async findBank() {
    const axios = getAxios();
    const res = await axios.get(this.url + '/get-bank');
    return res;
  }

  public async searchBank(form: BankForm, skip: number) {
    const axios = getAxios();
    let params: any = { 
      $skip: skip 
    }
    if (form.bank_name) {
      params.bank_name = form.bank_name
    }
    if (form.branch_name) {
      params.branch_name = form.branch_name
    }
    const res = await axios.get(this.url + '/bank', {
      params: params
    });
    return res;
  }

  public async addBank(form: AddBankForm) {
    const axios = getAxios();
    const res = await axios.post(`${this.url}/bank`, {
      ...form
    });
    return res;
  }

  public async getBank(bank_id: string) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/bank/${bank_id}`);
    return res;
  }

  public async editBank(req: any) {
    const axios = getAxios();
    const bank_id = _.get(req, 'bank_id');
    const res = await axios.patch(`${this.url}/bank/${bank_id}`, {
      bank_name: _.get(req, 'bank_name'),
      add_branch: _.get(req, 'add_branch'),
      edit_branch: _.get(req, 'edit_branch'),
      delete_branch: _.get(req, 'delete_branch'),
      is_delete: _.get(req, 'is_delete'),
      is_active: _.get(req, 'is_delete') ? 0 : 1
    });
    return res;
  }


}
