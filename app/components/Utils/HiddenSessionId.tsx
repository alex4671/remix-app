import { nanoid } from 'nanoid';

export const HiddenSessionId = () => {
	// const id = sessionStorage.getItem('sessionId') ?? nanoid();
	const id = nanoid();

	return (
		<input
			type="hidden"
			name={'sessionId'}
			value={id}
		/>
	);
};
