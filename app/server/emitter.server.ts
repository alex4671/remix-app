import { EventEmitter } from 'node:events';

let emitter: EventEmitter;

declare global {
	var __eventEmitter: EventEmitter;
}

if (process.env.NODE_ENV === 'production') {
	emitter = new EventEmitter();
} else {
	if (!global.__eventEmitter) {
		global.__eventEmitter = new EventEmitter();
	}
	emitter = global.__eventEmitter;
}

export { emitter };
