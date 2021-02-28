import { Injectable } from '@angular/core';
import { config } from '../../../environments/environment';
import * as _ from 'lodash';
import { AddChequeForm } from 'src/app/component/home/cheque/modal-add-cheque/modal-add-cheque';
import { getAxios } from '../set-header';

@Injectable({
  providedIn: 'root'
})
export class ChequeService {

  url: string;

  constructor() { 
    this.url = _.get(config, 'service.url');
  }

  async searchPendingCheque(req: any, skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/pending-cheque`, {
      params: { ...req, $skip: skip }
    });
    return res;
  }

  async findPendingCheque(skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/pending-cheque`, {
      params: { $skip: skip }
    });
    return res;
  }

  async addCheque(form: AddChequeForm) {
    const axios = getAxios();
    const res = await axios.post(`${this.url}/pending-cheque`, {
      ...form
    });
    return res;
  }

  async editPendingCheque(form: any) {
    const axios = getAxios();
    const cheque_id = form.cheque_id;
    const res = await axios.patch(`${this.url}/pending-cheque/${cheque_id}`, {
      ...form
    });
    return res;
  }

  async getPendingCheque(cheque_id: string) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/pending-cheque/${cheque_id}`);
    return res;
  }

  async searchWaitingCheque(req: any) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/waiting-cheque`, {
      params: { ...req }
    });
    return res;
  }

  async findWaitingCheque() {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/waiting-cheque`);
    return res;
  }

  async editWaitingCheque(form: any) {
    const axios = getAxios();
    const cheque_id = form.cheque_id;
    const res = await axios.patch(`${this.url}/waiting-cheque/${cheque_id}`, {
      ...form
    });
    return res;
  }

  async searchApproveCheque(req: any) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/approve-cheque`, {
      params: { ...req }
    });
    return res;
  }

  async findApproveCheque() {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/approve-cheque`);
    return res;
  }

  async editApproveCheque(form: any) {
    const axios = getAxios();
    const cheque_id = form.cheque_id;
    const res = await axios.patch(`${this.url}/approve-cheque/${cheque_id}`, {
      ...form
    });
    return res;
  }

}
