import { nanoid } from 'nanoid';
import { useEffect } from 'react';

export const useSetSessionId = () => {
	useEffect(() => {
		console.log('call useSetSessionId');
		const sessionId = sessionStorage.getItem('sessionId');
		if (!sessionId) {
			sessionStorage.setItem('sessionId', nanoid());
		}
	}, []);

	return null;
};
