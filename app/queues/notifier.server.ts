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

	// console.log(`Email sent to ${job.data.emailAddress}`);
	console.log(`Users count ${usersCount}`);
});
