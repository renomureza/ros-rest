# ROS REST - RouterOS REST API

## Pengantar

Buat permintaan HTTP (REST API) dari Node.js ke RouterOS. REST API adalah fitur baru, ini mulai tersedia di **RouterOS v7.1beta4**.

## Getting Started

### Prasyarat

- Gunakan [RouterOS v7.1beta4](https://mikrotik.com/download) atau yang paling baru.
- Install [Node.js](https://nodejs.org/en/).
- Aktifkan layanan **www-ssl** (Winbox: IP > Services).
- Pasang sertifikat CA, kalau hanya digunakan di jaringan lokal (untuk pengujian) buat sertifikat yang ditandatangani sendiri (_self-signed_), jalankan perintah berikut di Terminal Winbox ([selengkapnya](https://forum.mikrotik.com/viewtopic.php?f=1&t=172789)):

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

### Instalasi

Untuk menginstall ROS REST, jalankan perintah berikut:

**npm:**

```shell
npm i ros-rest
```

atau, **yarn:**

```shell
yarn add ros-rest
```

### Konfigurasi

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

Fungsi `rosRest` mengharapkan objek kredential RouterOS dan mengembalikan method yang akan kita bahas di bawah.

Berikut daftar properti objek yang diharapkan `rosRest`:

| Properti   | Tipe    | Default | Deskripsi                                                                         |
| ---------- | ------- | ------- | --------------------------------------------------------------------------------- |
| `host`     | string  | -       | host RouterOS                                                                     |
| `port`     | number  | `443`   | port layanan _www-sssl_ RouterOS                                                  |
| `user`     | string  | -       | user untuk masuk ke RouterOS                                                      |
| `password` | string  | -       | password untuk masuk ke RouterOS                                                  |
| `secure`   | boolean | `false` | apakah sertifikat divalidasi oleh otoritas sertifikat (CA) yang dipercaya publik? |

> **Catatan:** Jika sertifikat ditandatangani sendiri atur `secure` menjadi `false` (default). Jika sertifikat divalidasi oleh [otoritas seritifkat (CA)](https://en.wikipedia.org/wiki/Certificate_authority) dan RouterOS dapat diakses melalui jaringan publik, atur `secure` menjadi `true` untuk keamanan.

## Method

Berikut daftar method yang bisa kita gunakan yang dikembalikan fungsi `rosRest`:

| HTTP   | RouterOS | ROS REST | Description                              |
| ------ | -------- | -------- | ---------------------------------------- |
| GET    | print    | print    | untuk mengambil data                     |
| PUT    | add      | add      | untuk membuat data baru                  |
| PATCH  | set      | set      | untuk mempebarui data                    |
| DELETE | remove   | remove   | untuk menghapus data                     |
| POST   |          | command  | untuk mengakses berbagai perintah konsol |

Pelajari selengkapnya: [Dokumentasi RouteOS REST API](https://help.mikrotik.com/docs/display/ROS/REST+API)

Semua method mengembalikan Promise, kita bisa menanganinya menggunakan `then/catch` atau `try/catch`.

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

Untuk error handling dan response schema, lihat dokumentasi Axios:

- [Error Handling](https://axios-http.com/docs/handling_errors)
- [Response Schema](https://axios-http.com/docs/res_schema)

### `print`

Contoh mengambil semua data IP Address (Winbox: IP > Address):

```js
clientRosRest.print('ip/address');
```

Ambil berdasarkan id, ehter, atau berdasarkan properti yang berisi nilai tertentu:

```js
clientRosRest.print('ip/address/*2');
clientRosRest.print('ip/address/ether1');
clientRosRest.print('ip/address?network=10.155.101.0&dynamic=true');
```

Jika kita hanya memerlukan properti tertentu, gunakan `.proplist`:

```js
clientRosRest.print('ip/address?.proplist=address,disabled');
```

### `add`

Contoh menambahkan IP Address baru:

```js
clientRosRest.add('ip/address', {
  address: '192.168.10.1/24',
  network: '192.168.10.1',
  interface: 'ether2',
  comment: 'test ROS REST',
});
```

### `set`

Contoh memperbarui komentar IP Address yang memiliki id `*13`:

```js
clientRosRest.set('ip/address/*13', {
  comment: 'update comment test ROS REST',
});
```

### `remove`

Contoh menghapus IP Address yang memiliki id `*13`:

```js
clientRosRest.remove('ip/address/*13');
```

### `command`

Semua fitur API tersedia melalui `command` metode.

```js
clientRosRest.command('interface/print', {
  '.proplist': ['name', 'type'],
});

// or

clientRosRest.command('interface/print', {
  '.proplist': 'name,type',
});
```

## Berkontribusi

Kontribusi, masalah, dan permintaan fitur dipersilakan. Jangan ragu untuk memeriksa [halaman masalah](https://github.com/renomureza/ros-rest/issues) jika Anda ingin berkontribusi.
