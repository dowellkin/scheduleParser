require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  databaseURL: process.env.databaseURL,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId: process.env.measurementId
};
const firebase = require('firebase/app');
const fs = require('fs');
require('firebase/database');
firebase.initializeApp(firebaseConfig);

// console.log("~".repeat(50))
// console.log("\n".repeat(20))

// let teachers;
// let lessons;



function init(){
	firebase.database().ref('options/').once("value")
		.then(res => {
			const data = res.val();

			// teachers: data.teachers
			// lessons: data.lessons

			console.log('you called me');

			return {teachers: data.teachers, lessons: generateNames(data.lessons)}
		})
		.catch(err => {
			console.error(err);
			process.exit();
		})
}

function main({path}){
	// const path = 'IT041.json'
	return new Promise(async (resolve, reject) => {
		// const {teachers, lessons} = await init();
		const fb = await firebase.database().ref('options/').once("value");
		const info = fb.val();

		const teachers = info.teachers
		const lessons = generateNames(info.lessons)

		if(path == undefined) {
			console.log('path is required')
			reject('path is required')
		}
		const file = fs.readFileSync(path);
		const data = JSON.parse(file);

		for (const key in data) {
			if (Object.hasOwnProperty.call(data, key)) {
				data[key].forEach((lesson, index) => {
					const les = new Lesson(lesson);
					les.findTeacherId(teachers);
					les.findLessonId(lessons);
					if(les.errors.length > 0){
						console.log('check errors:');
						les.errors.forEach(err => {
							console.error(err)
						})
					}
					// console.log(les.toObject)
					// console.log(lesson, 'lesson')
					data[key][index] = les.toObject;
				});
			}
		}

		// console.log(data);
		fs.writeFileSync(path, JSON.stringify(data, null, 2));
		resolve('success');
	})
}


function generateNames(lessons){
	return lessons.map( el => {
		if(typeof el == 'string'){
			return [el]
		} else {
			let result = [el.title, el.shorttitle];
			if(el.alsoKnownAs){
				result = [...result, ...el.alsoKnownAs];
			}
			return result
		}
	})
}


class Lesson{
	constructor(lesson){
		this.data = lesson;
		this.errors = [];
		delete this.data.hash;
		if(this.data.teacher.length > 0){
			this.data.teacher = this.data.teacher.match(/[^,]+$/)[0].trim();
		}
	}

	findTeacherId(teachers){
		if(this.data.teacher.length == 0) return false
		const index = teachers.findIndex(teacher => {
			const lastname = this.data.teacher.split(' ')[0];
			return ~teacher.name.indexOf(lastname);
		})
		if(~index){
			this.data.teacherId = index;
			// console.log('success');
		} else {
			// this.errors.push({
			// 	message: 'teacher id failed',
			// })
			// console.log('teacher id failed');	
			console.log(`[teacher]:\t${this.data.teacher} is not found`);	
			// console.log(this.data);		
		}
	}

	findLessonId(lessons){
		const index = lessons.findIndex(lesson => {
			lesson = lesson.map(el => el.toLowerCase())
			return ~lesson.indexOf(this.data.name.toLowerCase());
		})
		if(~index){
			this.data.lessonId = index;
			// console.log('success');
		} else {
			// this.errors.push({
			// 	message: 'lesson id failed',
			// })
			console.log(`[lesson]:\t${this.data.name} is not found`);			
			// console.log(this.data);
		}

	}

	get toObject(){
		return this.data;
	}
}

module.exports = {
	main
};