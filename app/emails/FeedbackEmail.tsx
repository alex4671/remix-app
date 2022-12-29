import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Html } from '@react-email/html';
import { Preview } from '@react-email/preview';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';

export default function FeedbackEmail({
	userEmail,
	feedback,
	type,
}: {
	userEmail: string;
	feedback: string;
	type: string;
}) {
	return (
		<Html>
			<Head />
			<Preview>{`Feedback from ${userEmail}`}</Preview>
			<Section style={main}>
				<Container style={container}>
					<Text style={h3}>From {userEmail}</Text>
					<Text style={h3}>Type: {type}</Text>
					<Text style={h3}>Feedback: {feedback}</Text>
				</Container>
			</Section>
		</Html>
	);
}

const main = {
	backgroundColor: '#ffffff',
};

const container = {
	paddingLeft: '12px',
	paddingRight: '12px',
};

const h3 = {
	color: '#333',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '18px',
	margin: '20px 0',
	padding: '0',
};
