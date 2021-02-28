import { Injectable } from '@angular/core';
import { AddTransferForm } from 'src/app/component/home/transfer/modal-add-transfer/modal-add-transfer';
import { TransferForm } from 'src/app/component/home/transfer/transfer';
import { Transferred, TransferredReq } from 'src/app/component/home/transferred/transferred';
import { config } from '../../../environments/environment';
import { getAxios } from '../set-header';

@Injectable({
  providedIn: 'root'
})
export class TransferService {

  url: string;

  constructor() {
    this.url = config?.service.url;
  }

  public async findTransfer(skip: number) {
    const axios = getAxios();
    const res = await axios.get(`${this.url}/transfer`, {
      params: { $skip: skip }
    });
    return res;
  }

  public async searchTransfer(form: TransferForm, skip: number) {
    const axios = getAxios();
    let req: any = {};
    if (form.customer_id) req.customer_id = form.customer_id;
    if (form.amount) req.amount = form.amount;
    if (form.transfer_date_from) req.transfer_date_from = form.transfer_date_from;
    if (form.transfer_date_to) req.transfer_date_to = form.transfer_date_to;
    req.$skip = skip;
    const res = await axios.get(`${this.url}/transfer`, {
      params: req
    });
    return res;
  }

  public async createTransfer(form: AddTransferForm) {
    const axios = getAxios();
    const res = await axios.post(`${this.url}/transfer`, {
      ...form
    });
    return res;
  }

  public async editTransfer(form: Transferred[]) {
    const axios = getAxios();
    const res = await axios.post(`${this.url}/patch-transfer`, {
      items: [...form]
    });
    return res;
  }

  public async editTransferUnset(form: TransferredReq[]) {
    const axios = getAxios();
    const res = await axios.post(`${this.url}/patch-transfer-unset`, {
      items: [...form]
    });
    return res;
  }

}
