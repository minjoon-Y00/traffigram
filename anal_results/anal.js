const fs = require('fs');

const results_11a = readFileSync('results_11a.js');
const results_11b = readFileSync('results_11b.js');
const results_13a = readFileSync('results_13a.js');
const results_13b = readFileSync('results_13b.js');
const results_15a = readFileSync('results_15a.js');
const results_15b = readFileSync('results_15b.js');

let results = {
	'11': new Array(10),
	'13': new Array(10),
	'15': new Array(10),
};

for(let i = 0; i < 5; ++i) results['11'][i] = results_11a['11'][i];
for(let i = 5; i < 10; ++i) results['11'][i] = results_11b['11'][i];
for(let i = 0; i < 5; ++i) results['13'][i] = results_13a['13'][i];
for(let i = 5; i < 10; ++i) results['13'][i] = results_13b['13'][i];
for(let i = 0; i < 5; ++i) results['15'][i] = results_15a['15'][i];
for(let i = 5; i < 10; ++i) results['15'][i] = results_15b['15'][i];

let str = '';

str += makeStr(results['15']);
str += makeStr(results['13']);
str += makeStr(results['11']);

saveTextAsFile(str, 'out');



function makeStr(results) {
	let str = '';
	for(let i = 0; i < 10; i++) {
		const rets = results[i];

		let numLoc = 0;
		let numSRC = 0;
		let sum = {dijk: 0, lv0: 0, lv1: 0, lv2: 0, lv3: 0};
		for(let v of rets) { // <= 30
			if (v.actual !== undefined) {
				numLoc++;
				sum.lv0 += Math.abs(v.actual - v['2-2']);
				sum.lv1 += Math.abs(v.actual - v['4-2']);
				sum.lv2 += Math.abs(v.actual - v['4-4']);
				sum.lv3 += Math.abs(v.actual - v['8-4']);

				if (v.dijk !== undefined) {
					numSRC++;
					sum.dijk += Math.abs(v.actual - v.dijk);
				}
			}
		}

		str += numLoc + ',' + numSRC + ',' + sum.dijk + ',' + 
				(sum.dijk / numSRC) + ',' + sum.lv0 + ',' +
				(sum.lv0 / numLoc) + ',' + sum.lv1 + ',' + 
				(sum.lv1 / numLoc) + ',' + sum.lv2 + ',' + 
				(sum.lv2 / numLoc) + ',' + sum.lv3 + ',' + 
				(sum.lv3 / numLoc) + '\n'; 
	}
	return str;
}

//console.log(str);
//saveTextAsFile(str, 'out');

//console.log(results['11'][8]);




function readFileSync(file) {
  return JSON.parse(fs.readFileSync('./' + file, 'utf8'));
}

function saveTextAsFile(str, filename) {
  filename = './' + filename + '.csv';
  fs.writeFile(filename, str, function(err) {
    if(err) return console.log(err);
  });
}