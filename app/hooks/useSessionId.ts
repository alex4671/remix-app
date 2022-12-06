import { nanoid } from 'nanoid';
import { useEffect } from 'react';

export const useSessionId = () => {
	useEffect(() => {
		const sessionId = sessionStorage.getItem('sessionId');
		if (!sessionId) {
			sessionStorage.setItem('sessionId', nanoid());
		}
	}, []);

	return null;
};
