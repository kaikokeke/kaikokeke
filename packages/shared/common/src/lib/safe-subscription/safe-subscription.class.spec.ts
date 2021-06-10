import { interval, Subscription } from 'rxjs';

import { SafeSubscriber } from './safe-subscriber.type';
import { SafeSubscription } from './safe-subscription.class';

const key = 'a';
const fn = () => interval(10).subscribe();
const fn2 = () => interval(5).subscribe();

describe('SafeSubscription', () => {
  let safeSubscription: SafeSubscription;
  let map: Map<PropertyKey, SafeSubscriber>;

  beforeEach(() => {
    safeSubscription = new SafeSubscription();
    map = safeSubscription['_safeSubscriptions'];
  });

  afterEach(() => {
    map.forEach((v) => v.subscription.unsubscribe());
    jest.restoreAllMocks();
  });

  it(`add(key, fn) adds the Subscription if the key doesn't exist`, () => {
    expect(map.get(key)).toBeUndefined();
    safeSubscription.add(key, fn);
    expect(map.get(key)).toEqual({ subscription: expect.any(Subscription), args: [] });
    expect(map.get(key).subscription.closed).toEqual(false);
  });

  it(`add(key, fn) does nothing if the key exists`, () => {
    jest.spyOn(map, 'set');
    safeSubscription.add(key, fn);
    expect(map.set).toHaveBeenNthCalledWith(1, key, { subscription: expect.any(Subscription), args: [] });
    safeSubscription.add(key, fn2);
    expect(map.set).toBeCalledTimes(1);
  });

  it(`add(key, fn) replaces the Subscription if the key exists and the Subscription is closed`, () => {
    jest.spyOn(map, 'set');
    safeSubscription.add(key, fn);
    expect(map.set).toHaveBeenNthCalledWith(1, key, { subscription: expect.any(Subscription), args: [] });
    map.get(key).subscription.unsubscribe();
    safeSubscription.add(key, fn2);
    expect(map.set).toHaveBeenNthCalledWith(2, key, { subscription: expect.any(Subscription), args: [] });
    expect(map.get(key).subscription.closed).toEqual(false);
  });

  it(`add(key, fn, args) does nothing if the key exists and args are equal`, () => {
    jest.spyOn(map, 'set');
    safeSubscription.add(key, fn, 0);
    expect(map.set).toHaveBeenNthCalledWith(1, key, { subscription: expect.any(Subscription), args: [0] });
    safeSubscription.add(key, fn2, 0);
    expect(map.set).toBeCalledTimes(1);
  });

  it(`add(key, fn, args) replaces the Subscription if the key exists and the args aren't equal`, () => {
    jest.spyOn(map, 'set');
    safeSubscription.add(key, fn, 0);
    expect(map.set).toHaveBeenNthCalledWith(1, key, { subscription: expect.any(Subscription), args: [0] });
    safeSubscription.add(key, fn2, 1);
    expect(map.set).toHaveBeenNthCalledWith(2, key, { subscription: expect.any(Subscription), args: [1] });
    expect(map.get(key).subscription.closed).toEqual(false);
  });

  it(`add(key, fn, args) unsubscribes before replace the Subscription`, () => {
    safeSubscription.add(key, fn, 0);
    const sub = map.get(key).subscription;
    jest.spyOn(sub, 'unsubscribe');
    expect(sub.unsubscribe).not.toHaveBeenCalled();
    safeSubscription.add(key, fn2, 1);
    expect(sub.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it(`add(key, fn, args) uses deep equals for args`, () => {
    jest.spyOn(map, 'set');
    safeSubscription.add(key, fn, { a: 0, b: 1 });
    expect(map.set).toHaveBeenNthCalledWith(1, key, { subscription: expect.any(Subscription), args: [{ a: 0, b: 1 }] });
    safeSubscription.add(key, fn2, { a: 0, b: 1 });
    expect(map.set).toBeCalledTimes(1);
  });

  it(`get(key) returns the key Subscription`, () => {
    safeSubscription.add(key, fn);
    expect(safeSubscription.get('a')).toEqual(map.get('a').subscription);
  });

  it(`get(key) returns undefined if the key doesn't exist`, () => {
    expect(safeSubscription.get(key)).toBeUndefined();
  });

  it(`unsubscribe() unsubscribes all Subscriptions`, () => {
    safeSubscription.add('a', fn);
    safeSubscription.add('b', fn);
    const subA = map.get('a').subscription;
    const subB = map.get('b').subscription;
    jest.spyOn(subA, 'unsubscribe');
    jest.spyOn(subB, 'unsubscribe');
    expect(subA.unsubscribe).not.toHaveBeenCalled();
    expect(subB.unsubscribe).not.toHaveBeenCalled();
    safeSubscription.unsubscribe();
    expect(subA.unsubscribe).toHaveBeenCalledTimes(1);
    expect(subB.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it(`unsubscribe() deletes all keys`, () => {
    safeSubscription.add('a', fn);
    safeSubscription.add('b', fn);
    expect(map.get('a')).toBeDefined();
    expect(map.get('b')).toBeDefined();
    safeSubscription.unsubscribe();
    expect(map.get('a')).toBeUndefined();
    expect(map.get('b')).toBeUndefined();
  });

  it(`unsubscribe(key) unsubscribes the key Subscription`, () => {
    safeSubscription.add(key, fn);
    const sub = map.get(key).subscription;
    jest.spyOn(sub, 'unsubscribe');
    expect(sub.unsubscribe).not.toHaveBeenCalled();
    safeSubscription.unsubscribe(key);
    expect(sub.unsubscribe).toHaveBeenCalledTimes(1);
  });

  it(`unsubscribe(key) deletes the key`, () => {
    safeSubscription.add('a', fn);
    expect(map.get('a')).toBeDefined();
    safeSubscription.unsubscribe('a');
    expect(map.get('a')).toBeUndefined();
  });

  it(`unsubscribe(key, key) works with multiple keys`, () => {
    safeSubscription.add('a', fn);
    safeSubscription.add('b', fn);
    safeSubscription.add('c', fn);
    expect(map.get('a')).toBeDefined();
    expect(map.get('b')).toBeDefined();
    expect(map.get('c')).toBeDefined();
    safeSubscription.unsubscribe('a', 'b');
    expect(map.get('a')).toBeUndefined();
    expect(map.get('b')).toBeUndefined();
    expect(map.get('c')).toBeDefined();
  });

  it(`unsubscribe(key) does nothing if the key doen't exist`, () => {
    jest.spyOn(map, 'delete');
    expect(map.delete).not.toHaveBeenCalled();
    safeSubscription.unsubscribe(key);
    expect(map.delete).not.toHaveBeenCalled();
  });
});
