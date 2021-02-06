import { Injectable } from '@angular/core';
import { config } from '../../../environments/environment';
import { getAxios } from '../set-header';

@Injectable({
  providedIn: 'root'
})
export class CashService {

  url: string;

  constructor() { 
    this.url = config.service.url;
  }

  async searchTransfer(req: any, skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/transfer`, {
      params: { ...req, $skip: skip }
    });
    return res;
  }

  async findTransfer(skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/transfer`, {
      params: { $skip: skip }
    });
    return res;
  }

  async createTransfer(req: any) {
    const axios = getAxios();
    const res = await axios.post(`${this.url}/transfer`, req);
    return res;
  }
  
}
