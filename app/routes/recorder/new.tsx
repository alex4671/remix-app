import { Group } from '@mantine/core';
import { useFetcher } from '@remix-run/react';
import { IconHeadset, IconScreenShare, IconVideo } from '@tabler/icons';
import { useRef, useState } from 'react';
import { DangerButton } from '~/components/Buttons/DangerButtom';
import { SecondaryButton } from '~/components/Buttons/SecondaryButton';

const audioRecordConstraints = {
	echoCancellation: true,
};
let shouldStop = false;
let stopped = false;

export default function RecorderNew() {
	const fetcher = useFetcher();

	const [isRecording, setIsRecording] = useState(false);

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

	const handleRecord = function ({ stream, mimeType }) {
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
		handleRecord({ stream, mimeType });
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

		handleRecord({ stream, mimeType });
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
		handleRecord({ stream, mimeType });

		if (videoRef?.current) {
			videoRef.current.srcObject = stream;
		}
	};

	return (
		<>
			{/*<Group my={'xl'}>*/}
			{/*	/!*<a*!/*/}
			{/*	/!*	href={'#'}*!/*/}
			{/*	/!*	download={`${Date.now()}.webm`}*!/*/}
			{/*	/!*	ref={downloadRef}*!/*/}
			{/*	/!*>*!/*/}
			{/*	/!*	Link*!/*/}
			{/*	/!*</a>*!/*/}
			{/*	*/}
			{/*</Group>*/}
			<Group
				my={'xl'}
				position={'apart'}
			>
				<Group>
					<SecondaryButton
						onClick={recordAudio}
						disabled={isRecording}
						leftIcon={<IconHeadset size={18} />}
					>
						Record Audio
					</SecondaryButton>
					<SecondaryButton
						onClick={recordVideo}
						disabled={isRecording}
						leftIcon={<IconVideo size={18} />}
					>
						Record Video
					</SecondaryButton>
					<SecondaryButton
						onClick={recordScreen}
						disabled={isRecording}
						leftIcon={<IconScreenShare size={18} />}
					>
						Record Screen
					</SecondaryButton>
				</Group>
				{isRecording ? (
					<Group>
						<DangerButton
							color={'red'}
							onClick={stopBtn}
						>
							Stop
						</DangerButton>
					</Group>
				) : null}
			</Group>

			<video
				autoPlay
				// height="480"
				width="100%"
				muted
				ref={videoRef}
			/>
		</>
	);
}
