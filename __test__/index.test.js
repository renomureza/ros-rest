const rosRest = require('../index');
const config = require('./config');
const isObject = (x) => typeof x === 'object' && x !== null;

const routerOSClient = rosRest(config);

test('add', async () => {
  const res = await routerOSClient.add('ip/address', {
    address: '192.168.10.1/24',
    network: '192.168.10.0',
    comment: 'test-ros-rest',
  });

  expect(res.code).toBe(201);
  expect(typeof res.message).toBe('string');
  expect(isObject(res.data)).toBe(true);
});

test('set', async () => {
  const resGet = await routerOSClient.get('ip/address?comment=test-ros-rest');
  const id = resGet.data[0]['.id'];
  const res = await routerOSClient.set(`ip/address/${id}`, {
    comment: 'update-test-ros-rest',
  });

  expect(res.code).toBe(200);
  expect(res.message).toBe(null);
  expect(isObject(res.data)).toBe(true);
});

test('command', async () => {
  const res = await routerOSClient.command('interface/print', { '.proplist': 'name,type' });

  expect(res.code).toBe(200);
  expect(res.message).toBe(null);
  expect(Array.isArray(res.data)).toBe(true);
});

test('get', async () => {
  const res = await routerOSClient.get('ip/address');

  expect(res.code).toBe(200);
  expect(res.message).toBe(null);
  expect(Array.isArray(res.data)).toBe(true);
});

test('remove', async () => {
  const resGet = await routerOSClient.get('ip/address?comment=update-test-ros-rest');
  const id = resGet.data[0]['.id'];
  const res = await routerOSClient.remove(`ip/address/${id}`);

  expect(res.code).toBe(204);
  expect(typeof res.message).toBe('string');
  expect(res.data).toBe(null);
});
