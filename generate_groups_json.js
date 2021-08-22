const fs = require('fs');

const file = fs.readFileSync('./full/allResult.json');
const data = JSON.parse(file);

fs.writeFileSync('./full/groups.json', JSON.stringify(Object.keys(data) , null, 2))
