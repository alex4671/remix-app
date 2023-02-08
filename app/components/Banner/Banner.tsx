import { Box, CloseButton, Container, Group } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export const Banner = () => {
	const [show, setShow] = useState(false);
	return (
		<AnimatePresence
			initial={false}
			mode={'popLayout'}
		>
			{show ? (
				<Box
					component={motion.div}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0, top: -40 }}
					transition={{ opacity: { duration: 0.3 } }}
					bg="emerald.3"
				>
					<Container
						size={'xl'}
						px={{ base: '12' }}
					>
						<Group
							position={'apart'}
							py={12}
						>
							<Box>Test new feature we just implement</Box>
							<CloseButton
								title="Close popover"
								size="xl"
								color="dark"
								variant={'transparent'}
								iconSize={20}
								onClick={() => setShow(false)}
							/>
						</Group>
					</Container>
				</Box>
			) : null}
		</AnimatePresence>
	);
};
