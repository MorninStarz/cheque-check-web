import { Injectable } from '@angular/core';
import { config } from 'src/environments/environment';
import { getAxios } from '../set-header';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {

  url: string;

  constructor() { 
    this.url = config?.service.url;
  }

  async searchFinancialMemo(req: any, skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/transaction`, {
      params: { ...req, $skip: skip }
    });
    return res;
  }

}
