import { prisma } from '~/server/db.server';
import { Queue } from '~/server/queue.server';

type QueueData = {
	emailAddress: string;
};

export const notifierQueue = Queue<QueueData>('notifier', async (job) => {
	console.log('job id', job.id);
	console.log('job data', job.data);
	// console.log(`Sending email to ${job.data.emailAddress}`);
	const usersCount = await prisma.user.count();
	// Delay 1 second to simulate sending an email, be it for user registration, a newsletter, etc.
	// await new Promise((resolve) => setTimeout(resolve, 1000));

	// try {
	// 	console.log('job.data.emitter', job.data.emitter);
	// 	emitter.emit(EventType.NOTIFIER);
	// 	console.log('emmit');
	// } catch (e) {
	// 	console.log('emmit error', e);
	// }
	// console.log('job.data.event', EventType.NOTIFIER);

	// await fetch('http://localhost:3000/testaction', {
	// 	method: 'POST',
	// });
	// console.log('tesat', emitter.eventNames());
	// console.log(`Email sent to ${job.data.emailAddress}`);
	console.log(`Users count ${usersCount}`);
});
