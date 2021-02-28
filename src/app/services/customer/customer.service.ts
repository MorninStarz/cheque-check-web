import { Injectable } from '@angular/core';
import { CustomerForm } from '../../component/home/customer/customer';
import { config } from '../../../environments/environment';
import * as _ from 'lodash';
import { ModalAddForm } from 'src/app/component/home/customer/modal-add/modal-add';
import { getAxios } from '../set-header';
import { FinancialForm } from 'src/app/component/home/financial/financial';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor() { }

  public async findCustomer() {
    const axios = getAxios();
    const url = _.get(config, 'service.url');
    const res = await axios.get(url + '/get-customer');
    return res;
  }

  public async searchCustomer(form: CustomerForm, skip: number) {
    const axios = getAxios();
    const url = _.get(config, 'service.url');
    let req: any = {};
    if (form.name) req.name = form.name;
    req.$skip = skip;
    const res = await axios.get(url + '/customer-search', {
      params: req
    });
    return res;
  }

  public async searchFinancialCustomer(form: FinancialForm, skip: number) {
    const axios = getAxios();
    const url = _.get(config, 'service.url');
    let req: any = {};
    if (form.customer_id) req.customer_id = form.customer_id;
    req.$skip = skip;
    const res = await axios.get(url + '/customer-search', {
      params: req
    });
    return res;
  }

  public async createCustomer(form: ModalAddForm) {
    const axios = getAxios();
    const url = _.get(config, 'service.url');
    const res = await axios.post(url + '/customer', {
      ...form
    });
    return res;
  }

  public async editCustomer(customer_id: string, form: any) {
    const axios = getAxios();
    const url = _.get(config, 'service.url');
    const res = await axios.patch(`${url}/customer/${customer_id}`, {
      ...form
    });
    return res;
  }

  public async deleteCustomer(customer_id: string) {
    const axios = getAxios();
    const url = _.get(config, 'service.url');
    const res = await axios.patch(`${url}/customer/${customer_id}`, {
      is_active: 0
    });
  }

}
