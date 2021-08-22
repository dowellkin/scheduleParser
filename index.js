const parser = require('./modules/parser.js');
const cnv = require('./modules/nameConverter.js');
const generator = require('./modules/scheduleGenerator.js');
const firebaseMoves = require('./modules/scheduleWithFirebase.js');

const pathFile = './parsed';

const fs = require('fs');
require('dotenv').config();


const fullSchedule = process.argv.includes('--full') || process.argv.includes('-fs');
if(fullSchedule){
	require('./modules/generateFull.js')()
	console.log('generated successfully');
	process.exit(0);
}

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
	generateSchedule(groupname);
}

// generateSchedule('ИТ041');

function generateSchedule(groupname){
	// console.log(groupname, files[groupname])
	// let rawData = fs.readFileSync(pathFile + '/' + files[groupname][0]);
	// let data = JSON.parse(rawData);
	// console.log(generator.trim(data[0]))

	let rawData = []
	rawData.push(fs.readFileSync(pathFile + '/' + files[groupname][0]));
	rawData.push(fs.readFileSync(pathFile + '/' + files[groupname][1]));
	let data = rawData.map( element => JSON.parse(element) );

	let dayLessons = {};
	for(let day in data[0]){
		const days = [];
		for(let el in data){
			let tempDay = new generator.Day(data[el][day], {subgroup: +el+1})
			tempDay.makeMoves();
			days.push(tempDay);
		}
		const unique = new generator.Day().leftUniqueAlt(days);

		// console.log('\n\n\nsingle', unique);

		// dayLessons.push(unique);
		dayLessons[Object.keys(dayLessons).length] = (unique);
	}

	// console.log(dayLessons);
	const group = cnv.ruToEn(groupname)
	fs.writeFileSync(`./result/${group}.json`, JSON.stringify(dayLessons, null, 2));
	firebaseMoves.main({path: `./result/${group}.json`})
	.finally(result => {
		
		console.log('\n\nthat\'s all.');
		process.exit();
	})
	
}