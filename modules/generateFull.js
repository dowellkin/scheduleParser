const fs = require('fs');

const pathFile = './result';

function generate() {
	let files = {};
	if (!fs.existsSync(pathFile)) {
		console.log('Generate result first');
		process.exit(1);
	}

	const result = {};
	
	fs.readdirSync(pathFile).forEach(file => {
		const groupSchedule = fs.readFileSync(pathFile+'/'+file);
		const data = JSON.parse(groupSchedule);
		result[file.replace(/[^.]+$/, '').replace(/\.$/, '').toLowerCase()] = data;
	})

	fs.writeFileSync('./full/allResult.json', JSON.stringify(result, null, 2));
}

module.exports = generate;