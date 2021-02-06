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

  async searchCheque(req: any, skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/cheque`, {
      params: { ...req, $skip: skip }
    });
    return res;
  }

  async findCheque(skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/cheque`, {
      params: { $skip: skip }
    });
    return res;
  }

  async addCheque(form: AddChequeForm) {
    const axios = getAxios();
    const res = await axios.post(`${this.url}/cheque`, {
      ...form
    });
    return res;
  }

  async editCheque(form: any) {
    const axios = getAxios();
    const cheque_id = form.cheque_id;
    const res = await axios.patch(`${this.url}/cheque/${cheque_id}`, {
      ...form
    });
    return res;
  }

  async getCheque(cheque_id: string) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/cheque/${cheque_id}`);
    return res;
  }

  async deleteCheque(cheque_id: string) {
    const axios = getAxios();
    const res = await axios.delete(`${this.url}/cheque/${cheque_id}`);
    return res;
  }

}
