// jest.setup.js dosyası oluşturun (root dizinde)
import { EventEmitter } from 'events';
const oldEmitter = EventEmitter;

global.EventEmitter = function (...args) {
  return new oldEmitter(...args);
};
