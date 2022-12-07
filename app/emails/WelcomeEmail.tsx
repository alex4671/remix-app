import { Button } from '@react-email/button';
import { Container } from '@react-email/container';
import { Head } from '@react-email/head';
import { Html } from '@react-email/html';
import { Link } from '@react-email/link';
import { Preview } from '@react-email/preview';
import { Section } from '@react-email/section';
import { Text } from '@react-email/text';

export default function WelcomeEmail({ url }: { url: string }) {
	return (
		<Html>
			<Head />
			<Preview>Welcome to files app</Preview>
			<Section style={main}>
				<Container style={container}>
					<Text style={h1}>Welcome to files app</Text>
					<Text style={h3}>Click the link below to activate your account.</Text>
					<Button
						pX={12}
						pY={12}
						href={url}
						style={{ background: '#000', color: '#fff' }}
					>
						Activate account
					</Button>

					<Text
						style={{
							...text,
							color: '#ababab',
							marginTop: '14px',
							marginBottom: '16px',
						}}
					>
						If you didn&apos;t try to login, you can safely ignore this email.
					</Text>

					<Text style={footer}>
						<Link
							href="https://files.alexkulchenko.com/"
							target="_blank"
							style={{ ...link, color: '#898989' }}
						>
							Files app
						</Link>
					</Text>
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
	margin: '0 auto',
};

const h1 = {
	color: '#333',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '24px',
	fontWeight: 'bold',
	margin: '40px 0',
	padding: '0',
};

const h3 = {
	color: '#333',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '18px',
	margin: '20px 0',
	padding: '0',
};

const link = {
	color: '#2754C5',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '14px',
	textDecoration: 'underline',
};

const text = {
	color: '#333',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '14px',
	margin: '24px 0',
};

const footer = {
	color: '#898989',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	fontSize: '12px',
	lineHeight: '22px',
	marginTop: '12px',
	marginBottom: '24px',
};
