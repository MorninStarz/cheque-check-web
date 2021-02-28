import { Injectable } from '@angular/core';
import { config } from '../../../environments/environment';
import * as _ from 'lodash';
import { getAxios } from '../set-header';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  userInfo = JSON.parse(localStorage.getItem('userInfo'));
  url: string;

  constructor() { 
    this.url = _.get(config, 'service.url');
  }

  async findBranchByBankId(bank_id: string) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/get-branch`, {
      params: { bank_id: bank_id }
    });
    return res;
  }

}
