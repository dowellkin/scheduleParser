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
	}

	get isEmpty(){
		return !this.data.some(el => Boolean(el));
	}

	get asObject(){
		return this.meta;
	}

	get asJSON(){
		return JSON.stringify(this.asObject, null, 2)
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
			console.log(result);
			meta.push({
				fullname: part,
				name: result[2].trim(),
				type: result[4]?.trim() ?? '',
				weeks: (result[1].length == 0 ? [index + 1] : result[1].split(',')),
				teacher: result[5]?.trim() ?? result[7]?.trim() ?? '',
				lessonNumber: this.ind,
				room: ''
			});
		});

		const result = [meta[0]];
		for(let i = 1; i < meta.length; i++){
			const sameElement = result.find( el => el.fullname == meta[i].fullname );
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
	constructor(data){
		this.data = [];
		// console.log(data);
		// data.forEach((les, index) => {
		// 	this.data.push( new Lesson(les, {lessonNum: index + 1}) )
		// });
		for(let ind in data){
			this.data.push( new Lesson(data[ind], {lessonNum: +ind + 1}) )
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

	get asObject(){
		return this.data.map( el => el.asObject )
	}

	get asJSON(){
		return JSON.stringify(this.asObject, null, 2)
	}

	makeMoves(){
		this.data.forEach( el => {
			el.generateMeta();
		})
	}

	leftUnique(anotherDays){
		const data = this.data ?? [];
		const curTempLessons = data.map(el => el.asJSON);
		const daysLessonsTemp = anotherDays.map( day => {
			const result = day.asObject.map(lesson => JSON.stringify(lesson))
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
		
		return result
	}
}


module.exports = {
	trim,
	Lesson,
	Day
}