console.log(d_t);

let out = [];

//for(let idx = 0; idx < 1; ++idx) {
for(let idx = 0; idx < d_t.length; ++idx) {
	if (!d_t[idx].points) continue;

	for(let i = 0; i < d_t[idx].points.length; ++i) {
		for(let j = 0; j < d_t[idx].points.length; ++j) {
			if (i == j) continue;

			let obj = {};
			obj.s = d_t[idx].points[i].location;
			obj.t = d_t[idx].points[j].location;
			obj.d = distance(obj.s[1], obj.s[0], obj.t[1], obj.t[0]) * 1000; // m
			obj.time = d_t[idx].time[i][j];
			out.push(obj);
		}
	}
}

console.log(out);
saveTextAsFile(out, "result_seattle.js");

let strD = [];
let strTime = [];
for(let elt of out) {
	strD += elt.d + ',';
	strTime += elt.time + ',';
}
saveTextAsFile(strD, "result_seattle_d.csv");
saveTextAsFile(strTime, "result_seattle_time.csv");
//console.log(strD);
//console.log(strTime);


function distance(lat1, lng1, lat2, lng2) {
  var R = 6371 // km
  //var R = 3959 // 6371*0.621371 // miles
  var dLat = (lat2 - lat1) * Math.PI / 180
  var dLng = (lng2 - lng1) * Math.PI / 180
  var a = Math.sin(dLat / 2) * 
          Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180 ) * 
          Math.cos(lat2 * Math.PI / 180 ) * 
          Math.sin(dLng / 2) * 
          Math.sin(dLng / 2)
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  var d = R * c
  return d
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
