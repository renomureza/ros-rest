const pathJoin = require('path').join;
const httpsRequest = require('https').request;

const getContentLength = (body = '') => Buffer.byteLength(JSON.stringify(body));

const getBasicAuth = (user, password) => `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`;

const getHeaders = ({ user, password, body }) => ({
  'Content-Type': 'application/json',
  Authorization: getBasicAuth(user, password),
  'Content-Length': getContentLength(body),
});

const getPath = (path) => pathJoin('/rest', path);

const getOptionsRequest = ({ routerOS, method, body, path }) => ({
  host: routerOS.host,
  port: routerOS.port ?? 443,
  path: getPath(path),
  method,
  rejectUnauthorized: routerOS.secure ?? false,
  headers: getHeaders({ user: routerOS.user, password: routerOS.password, body }),
});

const response = ({ code, message, data }) => ({ code, message, data });

const responseSuccess = ({ res, data, resolve }) => {
  return resolve(
    response({
      code: res.statusCode,
      message: res.statusCode === 204 ? 'successfully removed' : res.statusCode === 201 ? 'added successfully' : null,
      data: data ? JSON.parse(data) : null,
    })
  );
};

const responseError = ({ res, data, reject }) => {
  const { detail, message } = JSON.parse(data);
  return reject(
    response({
      code: res.statusCode,
      message: detail ?? message,
      data: null,
    })
  );
};

const responseHandler = ({ res, data, resolve, reject }) => {
  if ([200, 201, 204].includes(res.statusCode)) {
    return responseSuccess({ res, data, resolve });
  }
  return responseError({ res, reject, data });
};

const makeRequest = ({ routerOS, body, method, path }) => {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(getOptionsRequest({ routerOS, method, body, path }), (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => responseHandler({ res, data, resolve, reject }));
    });

    request.on('error', (err) => {
      reject(err);
    });
    request.write(JSON.stringify(body ?? ''));
    request.end();
  });
};

const rosRest = ({ host, port = 443, user, password, secure = false }) => {
  const routerOS = {
    host,
    port,
    user,
    password,
    secure,
  };

  return {
    get: (path) => makeRequest({ routerOS, method: 'GET', path }),
    add: (path, body) => makeRequest({ routerOS, method: 'PUT', path, body }),
    set: (path, body) => makeRequest({ routerOS, method: 'PATCH', path, body }),
    remove: (path) => makeRequest({ routerOS, method: 'DELETE', path }),
    command: (path, body) => makeRequest({ routerOS, method: 'POST', path, body }),
  };
};

module.exports = rosRest;
