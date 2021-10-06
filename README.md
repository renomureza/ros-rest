# ROS REST - RouterOS REST API

Translate: [Indonesia](./README-id.md)

## Introduction

Make an HTTP request (REST API) from Node.js to RouterOS. The REST API is a new feature, it's starting to be available in **RouterOS v7.1beta4**.

## Getting Started

### Prerequisites

- Use [RouterOS v7.1beta4](https://mikrotik.com/download) or newer.
- Install [Node.js](https://nodejs.org/en/).
- Enable **www-ssl** service (Winbox: IP > Services).
- Install CA certificate, if only used on local network (for testing) create self-signed certificate, run following command in Winbox Terminal ([more](https://forum.mikrotik.com/viewtopic.php?f=1&t=172789)):

  ```
  /certificate
  add name=ca-template days-valid=3650 common-name=your.server.url key-usage=key-cert-sign,crl-sign
  add name=server-template days-valid=3650 common-name=your.server.url

  /certificate
  sign ca-template name=root-ca
  :delay 3s
  sign ca=root-ca server-template name=server
  :delay 3s

  /certificate
  set root-ca trusted=yes
  set server trusted=yes

  /ip service
  set www-ssl certificate=server disabled=no
  ```

### Install

To install ROS REST, run the following command:

**npm:**

```shell
npm i ros-rest
```

or, **yarn:**

```shell
yarn add ros-rest
```

### Configuration

```js
const rosRest = require('ros-rest');

const clientRosRest = rosRest({
  host: '192.168.100.32',
  user: 'user',
  password: 'password',
  port: 443, // default 443
  secure: false, // default false
});
```

The `rosRest` function expects a RouterOS credential object and returns the method which we will discuss below.

Here's a list of expected object properties for `rosRest`:

| Property   | Type    | Default | Description                                                                    |
| ---------- | ------- | ------- | ------------------------------------------------------------------------------ |
| `host`     | string  | -       | host RouterOS                                                                  |
| `port`     | number  | `443`   | port _www-sssl_ service RouterOS                                               |
| `user`     | string  | -       | user to login to RouterOS                                                      |
| `password` | string  | -       | password to login to RouterOS                                                  |
| `secure`   | boolean | `false` | is the certificate validated by a publicly trusted certificate authority (CA)? |

> **Note:** If the certificate is self-signed set `secure` to `false` (default). If the certificate is validated by a [certificate authority (CA)](https://en.wikipedia.org/wiki/Certificate_authority) and RouterOS is accessible over a public network, set `secure` to `true` for security.

## Method

Here's a list of the methods we can use that the `rosRest` function returns:

| HTTP   | RouterOS | ROS REST | Description                                             |
| ------ | -------- | -------- | ------------------------------------------------------- |
| GET    | print    | print    | To get the records.                                     |
| PUT    | add      | add      | To update a single record.                              |
| PATCH  | set      | set      | To create a new record.                                 |
| DELETE | remove   | remove   | To delete a single record.                              |
| POST   |          | command  | Universal method to get access to all console commands. |

Learn more: [RouteOS REST API Documentation](https://help.mikrotik.com/docs/display/ROS/REST+API)

All methods return a Promise, we can handle it using `then/catch` or `try/catch`.

`then/catch`:

```js
clientRosRest
  .print('ip/address')
  .then((res) => {
    console.log('result:', res);
  })
  .catch((err) => {
    console.log('error:', err);
  });
```

`try/catch`:

```js
const fetchRouterOS = async () => {
  try {
    const res = await clientRosRest.print('ip/address');
    console.log('result:', res);
  } catch (err) {
    console.log('error:', err);
  }
};

fetchRouterOS();
```

For error handling and response schema, see the Axios documentation:

- [Error Handling](https://axios-http.com/docs/handling_errors)
- [Response Schema](https://axios-http.com/docs/res_schema)

### `print`

Example of retrieving all IP Address data (Winbox: IP > Address):

```js
clientRosRest.print('ip/address');
```

Fetch by id, ether, or by a property containing a specific value:

```js
clientRosRest.print('ip/address/*2');
clientRosRest.print('ip/address/ether1');
clientRosRest.print('ip/address?network=10.155.101.0&dynamic=true');
```

If we only need certain properties, use `.proplist`:

```js
clientRosRest.print('ip/address?.proplist=address,disabled');
```

### `add`

Example of adding a new IP Address:

```js
clientRosRest.add('ip/address', {
  address: '192.168.10.1/24',
  network: '192.168.10.1',
  interface: 'ether2',
  comment: 'test ROS REST',
});
```

### `set`

Example of updating an IP Address comment that has id `*13`:

```js
clientRosRest.set('ip/address/*13', {
  comment: 'update comment test ROS REST',
});
```

### `remove`

Example of deleting IP Address which has id `*13`:

```js
clientRosRest.remove('ip/address/*13');
```

### `command`

All API features are available via the `command` method.

```js
clientRosRest.command('interface/print', {
  '.proplist': ['name', 'type'],
});

// or

clientRosRest.command('interface/print', {
  '.proplist': 'name,type',
});
```

## Contributing

Contributions, issues and feature requests are welcome. Feel free to check [issues page](https://github.com/renomureza/ros-rest/issues) if you want to contribute.
