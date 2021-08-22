const crypto = require('crypto');

function trim(arr){
	for(let i = arr.length - 1; i >= 0; i--){
		let lesson = new Lesson(arr[i]);
		if(lesson.isEmpty){
			arr.pop()
		} else {
			break
		}
	}
	return arr;
}

class Lesson {
	constructor(data, opt){
		this.data = data || [];
		this.meta = [];
		this.ind = opt.lessonNum;
		this.subgroup = opt.subgroup
	}

	get isEmpty(){
		return !this.data.some(el => Boolean(el));
	}

	get toObject(){
		return this.meta;
	}

	get toJSON(){
		return JSON.stringify(this.toObject, null, 2)
	}

	addKey(name, val){
		this.meta[name] = val;
	}

	setData(data){
		this.data = data;
	}

	generateMeta(){
		const meta = [];
		this.data.forEach((part, index) => {
			if(!part) return;

			const expression = /^(\d,\d|\d?)(.+?)(\((.{1,5})\)|,(.*))(,(.*))?/;
			part = part.replace(/\s{2,}/, ' ');
			const result = part.match(expression);
			// console.log(result);
			const temp = {
				fullname: part,
				name: result[2].trim(),
				type: result[4]?.trim() ?? '',
				weeks: (result[1].length == 0 ? [index + 1] : result[1].split(',')).map(el => +el),
				teacher: result[5]?.trim() ?? result[7]?.trim() ?? '',
				lessonNumber: this.ind,
				room: '',
				lessonId: -1,
				teacherId: -1,
			}
			const hashString = JSON.stringify(temp)
			temp['hash'] = crypto.createHash('md5').update(hashString).digest('hex');
			temp['group'] = this.subgroup
			meta.push(temp);
		});

		const result = [meta[0]];
		for(let i = 1; i < meta.length; i++){
			const sameElement = result.find( el => {
				return el.fullname == meta[i].fullname ||
				(el.name == meta[i].name && el.lessonNumber && meta[i].lessonNumber)
			} );
			// console.log(sameElement);
			if(Boolean(sameElement)){
				// if(Number.isInteger(sameElement.weeks)) sameElement.weeks = [sameElement.weeks];
				sameElement.weeks = sameElement.weeks.concat(meta[i].weeks);
			} else {
				result.push(meta[i]);
			}
		}
		this.meta = result;
		return result;
	}

	compare(anotherLesson){
		if(!(anotherLesson instanceof Lesson))
			throw 'can\'t compare: need type Lessson, got: ' + typeof anotherLesson + new Error().stack;
		
		return JSON.stringify(this.meta) == JSON.stringify(anotherLesson.meta);
	}


}

class Day {
	constructor(data, options){
		this.data = [];
		// console.log(data);
		// data.forEach((les, index) => {
		// 	this.data.push( new Lesson(les, {lessonNum: index + 1}) )
		// });
		this.subgroup = options?.subgroup;
		for(let ind in data){
			this.data.push( new Lesson(data[ind], {lessonNum: +ind, subgroup: this.subgroup}) )
		}
		this.trim();
	}

	getLesson(index){
		return this.data[index];
	}

	setData(data){
		this.data =  data;
	}

	trim(){
		for(let i = this.data.length - 1; i >= 0; i--){
			if(this.data[i].isEmpty){
				this.data.pop()
			} else {
				break
			}
		}
		return this.data;
	}

	get toObject(){
		const obj = this.data.map( el => el.toObject );
		// console.log('kkk', obj);
		return obj
	}

	get toJSON(){
		return JSON.stringify(this.toObject, null, 2)
	}

	makeMoves(){
		this.data.forEach( el => {
			el.generateMeta();
		})
	}

	leftUnique(anotherSubgroup){
		const data = this.data ?? [];
		const curTempLessons = data.map(el => el.toJSON);
		const daysLessonsTemp = anotherSubgroup.map( day => {
			const result = day.toObject.map(lesson => JSON.stringify(lesson))
			return result
		});

		const st = new Set(curTempLessons);
		daysLessonsTemp.forEach(day => {
			day.forEach( element => {
				st.add(element);
			})
		});
		const resultButJson = Array.from(st);
		const result = resultButJson.map(el => JSON.parse(el));
		return result.flat()
	}

	leftUniqueAlt(anotherSubgroup){
		anotherSubgroup = anotherSubgroup.map(el => el.toObject.flat().filter(el => !!el));
		let flatten = anotherSubgroup.flat();
		flatten = flatten.filter((el, index, arr) => {
			// console.log(el);
			let copy = {};
			if(arr.findIndex(findEl => {
				copy = findEl;
				return el.hash === findEl.hash
			}) === index){
				// console.log('keep');
				return true
			} else {
				// console.log('remove');
				delete copy['group']
				return false
			}
		})
		// console.log(flatten);
		return flatten;
	}

	
}


module.exports = {
	trim,
	Lesson,
	Day
}