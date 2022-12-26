import { useLocation } from '@remix-run/react';
import { useCallback, useState } from 'react';
import { createSearchParams } from 'react-router-dom';

export type ParamKeyValuePair = [string, string];

type URLSearchParamsInit =
	| string
	| ParamKeyValuePair[]
	| Record<string, string | string[]>
	| URLSearchParams;

type SetURLSearchParams = (
	nextInit?:
		| URLSearchParamsInit
		| ((prev: URLSearchParams) => URLSearchParamsInit),
) => void;

export function useStateOnlySearchParams() {
	let { search } = useLocation();
	let [state, setState] = useState<URLSearchParams>(
		new URLSearchParams(createSearchParams(search)),
	);

	let setSearchParams = useCallback<SetURLSearchParams>(
		(nextInit) => {
			const newSearchParams = createSearchParams(
				typeof nextInit === 'function' ? nextInit(state) : nextInit,
			);
			setState(newSearchParams);
			window.history.replaceState(
				{},
				'',
				hasAnySearchParams(newSearchParams)
					? `?${newSearchParams.toString()}`
					: '',
			);
		},
		[state],
	);

	return [state, setSearchParams] as const;
}

function hasAnySearchParams(searchParams: URLSearchParams) {
	return searchParams.toString().length > 0;
}
