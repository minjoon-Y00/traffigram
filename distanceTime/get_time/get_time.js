//console.log(ps);

const requestTimeSec = 2000;
const apiKey = 'pk.eyJ1IjoiYmFzc3QiLCJhIjoiY2pjamY0Y2RwMnk0cDJ3dDVqNHM4aWNqcCJ9.6_wLvPhbNLT_x4npXkWO2A';
const totalLen = ps.length; // 100;
//const totalLen = 3;
let idx = 0;

let out = new Array(totalLen);
for(let i = 0; i < totalLen; ++i) {
	out[i] = {points: null, time: null};
}
requestTravelTime();


function requestTravelTime() {
	let str = 'https://api.mapbox.com/directions-matrix/v1/mapbox/';
	// driving, cycling, walking
	//str += 'driving/';
	//str += 'cycling/';
	str += 'walking/';

	for(let i = 0; i < ps[idx].length - 1; ++i) 
		str += ps[idx][i].lng + ',' + ps[idx][i].lat + ';';

	const lastLoc = ps[idx][ps[idx].length - 1];
	str += lastLoc.lng + ',' + lastLoc.lat;

	str += '?access_token=' + apiKey;

	$.get(str, getTimeResult)
	.fail(console.log);

	if (++idx < totalLen) {
		setTimeout(requestTravelTime, requestTimeSec);
	}
	else {
		console.log('fin.');
		saveTextAsFile(out, "time_seattle.js");
	}
}

function getTimeResult(ret) {
	console.log('get time of ' + (idx - 1));
	out[idx - 1].points = ret.sources;
	out[idx - 1].time = ret.durations;
}

function saveTextAsFile(textToWrite, fileNameToSaveAs) {
  textToWrite = JSON.stringify(textToWrite)
  const textFileAsBlob = new Blob([textToWrite], {type:'text/plain'})
  let downloadLink = document.createElement("a")
  downloadLink.download = fileNameToSaveAs
  downloadLink.innerHTML = "Download File"
  downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
  downloadLink.click()
}