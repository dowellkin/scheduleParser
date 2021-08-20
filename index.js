const parser = require('./modules/parser.js');
const cnv = require('./modules/nameConverter.js');
const generator = require('./modules/scheduleGenerator.js');

const pathFile = './parsed';

const fs = require('fs');
require('dotenv').config();
const forceUpdate = process.argv.includes('--force') || process.argv.includes('-f');

let files = {};
if (!fs.existsSync(pathFile) || forceUpdate) {
	files = parser.parse();
	console.log('files parsed');
} else {
	fs.readdirSync(pathFile).forEach(file => {
		const groupname = file.match(/(.*)_.*_/)[1];
		if(files[groupname] == undefined) files[groupname] = [];
		files[groupname].push(file);
	})
	console.log('files already exits');
}

for(groupname in files){
	// console.log(groupname, files[groupname])
	// let rawData = fs.readFileSync(pathFile + '/' + files[groupname][0]);
	// let data = JSON.parse(rawData);
	// console.log(generator.trim(data[0]))

	let rawData = []
	rawData.push(fs.readFileSync(pathFile + '/' + files[groupname][0]));
	rawData.push(fs.readFileSync(pathFile + '/' + files[groupname][1]));
	let data = rawData.map( element => JSON.parse(element) );

	let dayLessons = [];
	for(let day in data[0]){
		const days = [];
		for(let el in data){
			let tempDay = new generator.Day(data[el][day])
			tempDay.makeMoves();
			days.push(tempDay);
		}
		dayLessons.push(new generator.Day().leftUnique(days));
	}

	// console.log(dayLessons);
	fs.writeFileSync(`./result/${cnv.ruToEn(groupname)}.json`, JSON.stringify(dayLessons, null, 2));
}