import { Injectable } from '@angular/core';
import { config } from '../../../environments/environment';
import { getAxios } from '../set-header';


@Injectable({
  providedIn: 'root'
})
export class AccountService {

  url: string

  constructor() { 
    this.url = config?.service?.url;
  }

  async searchAccount(req: any, skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/account`, {
      params: { ...req, $skip: skip }
    });
    return res;
  }

  async findAccount(skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/account`, {
      params: { $skip: skip }
    });
    return res;
  }

  async getAccount(customer_id: string) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/get-account`, {
      params: { customer_id: customer_id }
    });
    return res;
  }

}
