const xlsx = require('xlsx')
const fs = require('fs')

const filename = process.env.filename ?? 'sched.xls';

const file = xlsx.readFile(filename)
const sheets = file.Sheets
const sheetsNames = file.Props.SheetNames;
const sheet = sheets[sheetsNames[0]];
const merges = sheet['!merges'];

const dayCol = 1;
const timeCol = 2;
const indexCol = 3;
const groupRow = 1;

const days = process.env.days ?? 6;
const groupWidth = process.env.GroupWidth ?? 3;
const lessonHeight = process.env.lessonHeight ?? 4;
const lessonOnADay = process.env.lessonOnADay ?? 6;
const topOffset = process.env.topOffset ?? 1;
const leftOffset = process.env.leftOffset ?? 3;
const debug = process.env.debug ?? false;

// console.log(sheets);
// console.log(sheet.J2);
// console.log(sheet.J3);


merges.forEach(merge => {
	const val = sheet[colName(merge.s.c) + (merge.s.r + 1)];
	for(let c = merge.s.c; c <= merge.e.c; c++){
		for(let r = merge.s.r; r <= merge.e.r; r++){
			sheet[colName(c) + (r+1)] = val
		}
	}
});

// let column = toNum("D");


function parse(cb = function(){}){
	let column = leftOffset;
	let filenames = {};
	while(column < toNum('X')){
		generateJson(colName(column), (result) => {
			filenames[result.groupname] = result.files;
			console.log(`${result.groupname} group parsed succsessfully!`);
		});
		column += groupWidth;
	}
	cb(filenames);
	return filenames;
}


	// generateJson('J');

function toNum(str) {
  str = str.toUpperCase();
  let out = 0, len = str.length;
  for (pos = 0; pos < len; pos++) {
    out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
  }
  return out-1;
};

function colName(n) {
	var ordA = 'a'.charCodeAt(0);
	var ordZ = 'z'.charCodeAt(0);
	var len = ordZ - ordA + 1;

	var s = "";
	while(n >= 0) {
			s = String.fromCharCode(n % len + ordA) + s;
			n = Math.floor(n / len) - 1;
	}
	return s.toUpperCase();
}

function saveAsJson(name, data){
	if(!name.match(/\.json/))
		name += '.json';
	fs.writeFileSync(`./parsed/${name}`, JSON.stringify(data, null, 2));
}

function generateJson(firstGroupIndex, cb = function(){}) {
	// const temp = [];
	// const temp2 = [];
	const temp = {};
	const temp2 = {};
	// for(let i = 1; i <= 146; i++){
	// 	temp.push(sheet['J' + i]);
	// }
	const col = firstGroupIndex.toUpperCase();
	for(let day = 0; day < days; day++){
		const tempDay = [];
		const tempDay2 = [];
		// console.log(`~~~~day#${day}~~~~`);
		for(let lesson = 0; lesson < lessonOnADay; lesson++){
			const tempLesson = [];
			const tempLesson2 = [];
			// console.log(`~~~~lesson#${lesson}~~~~`);
			for(let weekLess = 0; weekLess < lessonHeight; weekLess++){
				const offset = topOffset + 1 + (day * lessonOnADay * lessonHeight) + (lesson * lessonHeight) + weekLess;

				// console.log(weekLess + ": \t", col + offset);

				tempLesson.push(sheet[col + (offset)]?.v ?? '')
				tempLesson2.push(sheet[colName(toNum(col)+1) + (offset)]?.v ?? '')
				if (debug) {
					console.log(offset, col + (offset), colName(toNum(col) + 1) + (offset));
				}
			}
			tempDay.push(tempLesson);
			tempDay2.push(tempLesson2);
			// console.log('~~~~lesson END~~~~');
		}
		// temp.push(tempDay);
		// temp2.push(tempDay2);
		temp[day] = (tempDay);
		temp2[day] = (tempDay2);
		// console.log('~~~~day END~~~~');
	}
	const groupname = sheet[firstGroupIndex + '1'].v;
	const group1filename = groupname + '_1st_group.json';
	const group2filename = groupname + '_2nd_group.json';
	saveAsJson(group1filename, temp);
	saveAsJson(group2filename, temp2);

	cb({files: [group1filename, group2filename], groupname});
}



module.exports = {parse}