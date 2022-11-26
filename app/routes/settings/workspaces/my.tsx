import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Box, Title } from '@mantine/core';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { nanoid } from 'nanoid';
import { useEffect, useState } from 'react';
import { WorkspaceItem } from '~/components/Settings/Workspaces/WorkspaceItem';
import { getUserWorkspacesById } from '~/models/workspace.server';
import { requireUser } from '~/server/session.server';
import { generateKeyBetween } from '~/utils/generateIndex';

export const loader = async ({ request }: LoaderArgs) => {
	const user = await requireUser(request);
	const workspaces = await getUserWorkspacesById(user.id);

	return json({ workspaces });
};

export default function MyWorkspaces() {
	const { workspaces } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const [workspacesCopy, setWorkspacesCopy] = useState(workspaces);

	useEffect(() => {
		setWorkspacesCopy(workspaces);
	}, [workspaces]);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const sortedCopy = workspacesCopy?.sort((a, b) =>
		a.sortIndex < b.sortIndex ? -1 : a.sortIndex > b.sortIndex ? 1 : 0,
	);

	return (
		<Box>
			{workspacesCopy.length ? (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
					modifiers={[restrictToVerticalAxis]}
				>
					<SortableContext
						items={sortedCopy}
						strategy={verticalListSortingStrategy}
					>
						{sortedCopy.map((w) => (
							<WorkspaceItem
								key={w.id}
								workspace={w}
							/>
						))}
					</SortableContext>
				</DndContext>
			) : (
				<Title
					order={5}
					align={'center'}
					my={24}
				>
					Create you first workspace to get started
				</Title>
			)}
		</Box>
	);

	function handleDragEnd(event: any) {
		const { active, over } = event;
		if (active.id !== over.id) {
			setWorkspacesCopy((prevState) => {
				const itemIndexMap = prevState.map((item) => item.id);
				const oldIndex = itemIndexMap.indexOf(active.id);
				const newIndex = itemIndexMap.indexOf(over.id);

				let newSortIndex: string;
				if (newIndex === prevState.length - 1) {
					// console.log("move to last position")
					newSortIndex = generateKeyBetween(
						prevState.at(newIndex)?.sortIndex,
						null,
					);
				} else if (newIndex === 0) {
					// console.log("move to first position")
					newSortIndex = generateKeyBetween(
						null,
						prevState.at(newIndex)?.sortIndex,
					);
				} else {
					if (oldIndex > newIndex) {
						// console.log("move to previous position")
						newSortIndex = generateKeyBetween(
							prevState.at(newIndex - 1)?.sortIndex,
							prevState.at(newIndex)?.sortIndex,
						);
					} else {
						// console.log("move to next position")
						newSortIndex = generateKeyBetween(
							prevState.at(newIndex)?.sortIndex,
							prevState.at(newIndex + 1)?.sortIndex,
						);
					}
				}

				fetcher.submit(
					{
						intent: 'changeSortOrder',
						workspaceId: active.id,
						newSortIndex,
						sessionId: sessionStorage.getItem('sessionId') ?? nanoid(),
					},
					{
						method: 'post',
						action: '/settings/workspaces',
					},
				);

				return prevState.map((p) =>
					p.id === active.id ? { ...p, sortIndex: newSortIndex } : p,
				);
			});
		}
	}
}
