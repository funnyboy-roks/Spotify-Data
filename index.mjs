import fs from 'fs';

const files = fs
	.readdirSync('data', {
		// withFileTypes: true,
	})
	.filter((f) => f.endsWith('json'))
	.filter((f) => !['UserAddress.json'].includes(f))
	.map((f) => ({ name: f, data: JSON.parse(fs.readFileSync('data/' + f, 'utf-8')) }));

const streamingHistory = files.filter((f) => f.name.startsWith('StreamingHistory')).flatMap((f) => f.data);

const songHistoryMap = {};

streamingHistory.forEach((song, i) => {
	const title = song.trackName;
	const artist = song.artistName;

	if (!(i % 1000)) console.log(((i * 100) / streamingHistory.length).toFixed(0) + '%');

	const key = title + '§' + artist;

	songHistoryMap[key] = (Object.keys(songHistoryMap).includes(key) ? songHistoryMap[key] : 0) + song.msPlayed;
});

const formatTime = (time) => {
	const ms = time % 1000;
	const s = Math.floor(time / 1000) % 60;
	const m = Math.floor(time / 1000 / 60) % 60;
	const h = Math.floor(time / 1000 / 60 / 60) % 24;
	const d = Math.floor(time / 1000 / 60 / 60 / 24) % 30;
	const mo = Math.floor(time / 1000 / 60 / 60 / 24 / 30) % 12;
	const y = Math.floor(time / 1000 / 60 / 60 / 24 / 30 / 12);

	const sections = ['ms', 's', 'm', 'h', 'd', 'mo', 'y'].reverse();
	const data = [ms, s, m, h, d, mo, y].reverse();

	return data
		.map((v, i) => ({ v, i }))
		.filter(({ v }) => v)
		.map(({ v, i }) => v + sections[i]).join` `;
};

// Generate general streaming history
console.log('Writing Streaming History.json...');
fs.writeFileSync('StreamingHistory.json', JSON.stringify(streamingHistory, null, 4));

// Generate song listen lengths
console.log('Writing SongHistory.json...');
const songHistory = Object.entries(songHistoryMap)
	.map(([k, v]) => ({ title: k.split`§`[0], artist: k.split`§`[1], msPlayed: v, timeFormatted: formatTime(v) }))
	.sort((a, b) => b.msPlayed - a.msPlayed);
fs.writeFileSync('SongHistory.json', JSON.stringify(songHistory, null, 4));

console.log(streamingHistory.length, Object.entries(songHistory).length);
