import { Box, Group } from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { useRef, useState } from 'react';
import { DangerButton } from '~/components/Buttons/DangerButtom';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';

const audioRecordConstraints = {
	echoCancellation: true,
};
let shouldStop = false;
let stopped = false;
export default function Recorder() {
	const fetcher = useFetcher();

	const [isRecording, setIsRecording] = useState(false);
	const [record, setRecord] = useState({
		type: null,
		src: null,
	});

	const videoRef = useRef<HTMLVideoElement>();
	const downloadRef = useRef<HTMLLinkElement>();

	const startRecord = () => {
		setIsRecording(true);
	};

	const stopRecord = () => {
		setIsRecording(false);
	};

	const stopBtn = () => {
		shouldStop = true;
		stopRecord();
	};

	const handleRecord = function ({ stream, mimeType, recordType }) {
		startRecord();
		let recordedChunks = [];
		stopped = false;
		const mediaRecorder = new MediaRecorder(stream);

		mediaRecorder.ondataavailable = function (e) {
			if (e.data.size > 0) {
				recordedChunks.push(e.data);
			}

			if (shouldStop === true && stopped === false) {
				mediaRecorder.stop();
				stopped = true;
			}
		};

		mediaRecorder.onstop = function () {
			const blob = new Blob(recordedChunks, {
				type: mimeType,
			});
			recordedChunks = [];

			if (downloadRef?.current) {
				// downloadRef.current.href = URL.createObjectURL(blob);
			}
			const formData = new FormData();
			const myFile = new File([blob], `${Date.now()}.webm`, {
				type: blob.type,
			});
			formData.append('file', myFile);
			formData.append('intent', 'uploadRecording');
			// formData.append('recordType', recordType);
			console.log('Test');
			fetcher.submit(formData, {
				method: 'post',
				action: '/recorder',
				encType: 'multipart/form-data',
			});
			setRecord({ src: URL.createObjectURL(blob), type: recordType });
			stopRecord();
			if (videoRef?.current) {
				videoRef.current.srcObject = null;
			}
		};

		mediaRecorder.start(200);
	};

	const recordAudio = async () => {
		const mimeType = 'audio/webm';
		shouldStop = false;
		const stream = await navigator.mediaDevices.getUserMedia({
			audio: audioRecordConstraints,
		});
		handleRecord({ stream, mimeType, recordType: 'audio' });
	};
	const recordVideo = async () => {
		const mimeType = 'video/webm';
		shouldStop = false;
		const constraints = {
			audio: {
				echoCancellation: true,
			},
			video: {
				width: {
					min: 640,
					max: 1024,
				},
				height: {
					min: 480,
					max: 768,
				},
			},
		};
		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		if (videoRef?.current) {
			videoRef.current.srcObject = stream;
		}

		handleRecord({ stream, mimeType, recordType: 'video' });
	};
	const recordScreen = async () => {
		const mimeType = 'video/webm';
		shouldStop = false;

		if (!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)) {
			return window.alert('Screen Record not supported!');
		}
		let stream;
		const displayStream = await navigator.mediaDevices.getDisplayMedia({
			video: { cursor: 'motion' },
			audio: { echoCancellation: true },
		});
		// if (window.confirm('Record audio with screen?')) {
		//
		// } else {
		// 	stream = displayStream;
		// 	handleRecord({ stream, mimeType });
		// }

		const audioContext = new AudioContext();

		const voiceStream = await navigator.mediaDevices.getUserMedia({
			audio: { echoCancellation: true },
			video: false,
		});
		const userAudio = audioContext.createMediaStreamSource(voiceStream);

		const audioDestination = audioContext.createMediaStreamDestination();
		userAudio.connect(audioDestination);

		if (displayStream.getAudioTracks().length > 0) {
			const displayAudio = audioContext.createMediaStreamSource(displayStream);
			displayAudio.connect(audioDestination);
		}

		const tracks = [
			...displayStream.getVideoTracks(),
			...audioDestination.stream.getTracks(),
		];
		stream = new MediaStream(tracks);
		handleRecord({ stream, mimeType, recordType: 'video' });

		if (videoRef?.current) {
			videoRef.current.srcObject = stream;
		}
	};

	return (
		<>
			<Group my={'xl'}>
				{/*<a*/}
				{/*	href={'#'}*/}
				{/*	download={`${Date.now()}.webm`}*/}
				{/*	ref={downloadRef}*/}
				{/*>*/}
				{/*	Link*/}
				{/*</a>*/}
				<DangerButton
					disabled={!isRecording}
					color={'red'}
					onClick={stopBtn}
				>
					Stop
				</DangerButton>
			</Group>
			<Group>
				<SecondaryButton
					onClick={recordAudio}
					disabled={isRecording}
				>
					Record Audio
				</SecondaryButton>
				<SecondaryButton
					onClick={recordVideo}
					disabled={isRecording}
				>
					Record Video
				</SecondaryButton>
				<SecondaryButton
					onClick={recordScreen}
					disabled={isRecording}
				>
					Record Screen
				</SecondaryButton>
			</Group>

			<Box my={24}>
				{record.type === 'audio' ? (
					<audio
						controls
						src={record.src}
					/>
				) : record.type === 'video' ? (
					<video
						controls
						width="100%"
						src={record.src}
					/>
				) : (
					<video
						autoPlay
						// height="480"
						width="100%"
						muted
						ref={videoRef}
					/>
				)}
			</Box>
		</>
	);
}
