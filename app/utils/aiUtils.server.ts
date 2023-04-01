import axios from 'axios';
import JSZip from 'jszip';
import sharp from 'sharp';
import smartcrop from 'smartcrop-sharp';

const WIDTH = 512;
const HEIGHT = 512;

export const createZipFolder = async (urls: string[]) => {
	const zip = new JSZip();
	const buffersUrls = [];

	for (const url of urls) {
		const response = await fetch(url);
		const arrayBuffer = await response.arrayBuffer();
		buffersUrls.push(Buffer.from(arrayBuffer));
	}

	const buffersPromises = buffersUrls.map((buffer) => {
		return smartcrop
			.crop(buffer, { width: WIDTH, height: HEIGHT })
			.then(function (result) {
				const crop = result.topCrop;
				return sharp(buffer)
					.extract({
						width: crop.width,
						height: crop.height,
						left: crop.x,
						top: crop.y,
					})
					.resize(WIDTH, HEIGHT)
					.toBuffer();
			});
	});

	const buffers = await Promise.all(buffersPromises);
	const folder = zip.folder('filderId');

	buffers.forEach((buffer, i) => {
		const filename = urls[i].split('/').pop();
		folder!.file(filename!, buffer, { binary: true });
	});

	return await zip.generateAsync({ type: 'nodebuffer' });
};

const replicateClient = axios.create({
	baseURL: 'https://dreambooth-api-experimental.replicate.com',
	headers: {
		Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
		'Content-Type': 'application/json',
		'Accept-Encoding': '*',
	},
});

export default replicateClient;
