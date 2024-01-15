import Cookie from 'js-cookie';

export const getQuery = (key: string) => {
  const search = window.location.search ? window.location.search.substring(1) : '';
  if (search) {
    const list = search.split('&');
    const obj = list.filter(Boolean).reduce((pre: any, cur: any) => {
      const arr = cur.split('=');
      const [KEY, value] = arr;
      pre[KEY] = value;
      return pre;
    }, {});
    return obj[key] || null;
  }
  return null;
};
export const getToken = () => {
  const token = Cookie.get('token');
  const _token = getQuery('_token');
  if (!token && _token) {
    Cookie.set('token', _token);
  }
  return token || _token;
};

export const getUserId = () => {
  const user = Cookie.get('sso_user_id');
  const _user = getQuery('_user');
  if (!user && _user) {
    Cookie.set('sso_user_id', _user);
  }
  return user || _user;
};

export const getTicker = () => {
  const _ticker: any = Cookie.get('_ticker');
  if (!_ticker) {
    Cookie.set('_ticker', _ticker);
  }
  return _ticker;
};

export const getUserToken = () => {
  return {
    _user: getUserId(),
    _token: getToken(),
  };
};

export const getSignT = () => {
  const us = new URLSearchParams(location.href);
  const _sign = us.get('_sign');
  const _t = us.get('_t');
  if (_sign && _t) {
    return {
      _sign,
      _t,
    };
  }
  return {};
};
