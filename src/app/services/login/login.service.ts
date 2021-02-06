import { Injectable } from '@angular/core';
import axios from 'axios';
import { LoginForm } from 'src/app/component/login/login';
import { config } from '../../../environments/environment';
import * as _ from 'lodash';
import { getAxios } from '../set-header';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() {
    axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    axios.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
  }

  public async auhenticate(loginForm: LoginForm) {
    const url = _.get(config, 'service.url');
    const res = await axios.post(url + '/authenticate', {
      ...loginForm
    });
    if (res) {
      return res;
    }
  }

  public async logout(user_id) {
    const url = config?.service?.url;
    const res = await axios.patch(url + '/authenticate', { user_id: user_id });
    return res;
  }

}
