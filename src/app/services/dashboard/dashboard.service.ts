import { Injectable } from '@angular/core';
import { config } from '../../../environments/environment';
import { getAxios } from '../set-header';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor() { 
    this.url = config.service.url;
  }

  url: string;

  public async findDashboard() {
    const axios = getAxios();
    const res = await axios.get(this.url + '/dashboard');
    return res;
  }

}
