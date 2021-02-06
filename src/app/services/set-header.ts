import axios from 'axios';

export const getAxios = () => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    const res = { ...axios };
    res.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    res.defaults.headers.common['Access-Control-Allow-Headers'] = '*';
    res.defaults.headers.common['authorization'] = `Bearer ${userInfo.token}`;
    return res;
}