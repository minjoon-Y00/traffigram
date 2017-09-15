const fs = require('fs');
const request = require('request');
let curDate = (new Date()).getDate();
let curHour = (new Date()).getHours() - 1;
//let curMinute = (new Date()).getMinutes();

const ctlPt_lv0 = readFileSync('ctlPt_lv0.js');
const ctlPt_lv1 = readFileSync('ctlPt_lv1.js');
const ctlPt_lv2 = readFileSync('ctlPt_lv2.js');
const locs_lv0 = readFileSync('locs_lv0.js');
const locs_lv1 = readFileSync('locs_lv1.js');
const locs_lv2 = readFileSync('locs_lv2.js');
const nodes_lv0 = readFileSync('con_nodes_lv0.js');
const nodes_lv1 = readFileSync('con_nodes_lv1.js');
const nodes_lv2 = readFileSync('con_nodes_lv2.js');

const timeInterval = 1000 // ms
const apiKeyTimeMatrix = 'matrix-qUpjg6W'; // Ray's
let timerSec = null;
let queue = [];
let startTimer = 0;

//startTimer = setInterval(intervalStartFunc, 1000);
setInterval(intervalFunc, 1000);
console.log('start.');
//requestTimes();

function requestTimes() {
  console.log('request all times.');

  addRequestLocCosts(locs_lv0, 'loc_lv0');
  addSaveLocCosts(locs_lv0, 'locs_lv0_costs');

  addRequestLocCosts(locs_lv1, 'loc_lv1');
  addSaveLocCosts(locs_lv1, 'locs_lv1_costs');

  addRequestLocCosts(locs_lv2, 'loc_lv2');
  addSaveLocCosts(locs_lv2, 'locs_lv2_costs');
  
  addRequestPtCosts(ctlPt_lv0, 'pt_lv0');
  addSavePtCosts(ctlPt_lv0, 'pts_lv0_costs');

  addRequestPtCosts(ctlPt_lv1, 'pt_lv1');
  addSavePtCosts(ctlPt_lv1, 'pts_lv1_costs');

  addRequestPtCosts(ctlPt_lv2, 'pt_lv2');
  addSavePtCosts(ctlPt_lv2, 'pts_lv2_costs');

  addRequestAllEdgeCosts(nodes_lv0, 'node_lv0');
  addSaveAllEdgeCosts(nodes_lv0, 'node_lv0_costs');

  addRequestAllEdgeCosts(nodes_lv1, 'node_lv1');
  addSaveAllEdgeCosts(nodes_lv1, 'node_lv1_costs');

  addRequestAllEdgeCosts(nodes_lv2, 'node_lv2');
  addSaveAllEdgeCosts(nodes_lv2, 'node_lv2_costs');

  timerSec = setInterval(processQueue, timeInterval);
}

function intervalStartFunc() {
  const t = new Date();

  if (t.getDate() !== curDate) {
    console.log('date changed.');
    requestTimes();

    curHour = (new Date()).getHours();
    setInterval(intervalFunc, 1000);

    clearInterval(startTimer);
  }
}

function intervalFunc() {
  const t = new Date();

  if (t.getHours() !== curHour) {
    console.log('hour changed.');
    curHour = t.getHours();
    requestTimes();
  }

  /*if (t.getMinutes() !== curMinute) {
    console.log('minute changed.');
    curMinute = t.getMinutes();
  }*/
}

function readFileSync(file) {
  return JSON.parse(fs.readFileSync('./data/' + file, 'utf8'));
}

function addRequestPtCosts(pts10, type) {
  for(let orgIdx = 0; orgIdx < pts10.length; orgIdx++) {
    let validPts = [];
    let validIndexes = [];
    let idx = 0;
    for(let pt of pts10[orgIdx].ctlPt) {
      if (!pt.inWater) {
        validPts.push(pt);
        validIndexes.push(idx);
      }
      idx++;
    }

    const numSegments = Math.ceil(validPts.length / 45);
    for(let segIdx = 0; segIdx < numSegments; segIdx++) {
      let q = {
        type: type,
        origin: pts10[orgIdx].origin,
        pts: validPts.slice(segIdx * 45, (segIdx + 1) * 45),
        indexes: validIndexes.slice(segIdx * 45, (segIdx + 1) * 45),
        orgIdx: orgIdx,
        segIdx: segIdx,
        pts10: pts10,
      };  
      queue.push(q);
    }
  }
  console.log('- addRequestPtCosts');
}

function addSavePtCosts(pts, filename) {
  const q = {
    type: 'savePtTimes',
    pts: pts,
    filename: filename,
  }
  queue.push(q);
  console.log('- addSavePtCosts');
}

function addRequestLocCosts(locs, type) {
  for(let i = 0; i < locs.length; ++i) {
    let q = {
      type: type,
      loc: locs[i],
      index: i,
    };
    queue.push(q);
  }
  console.log('- addRequestLocCosts: ' + locs.length);
}

function addSaveLocCosts(locs, filename) {
  const q = {
    type: 'saveLocTimes',
    locs: locs,
    filename: filename,
  }
  queue.push(q);
  console.log('- addSaveLocCosts');
}

function addRequestAllEdgeCosts(nodes, type) {
  for(let idx = 0; idx < nodes.length; idx++) {
    if (nodes[idx].conIndexes) {
      let q = {
        type: type,
        index: idx, 
        conIndexes: nodes[idx].conIndexes,
        startLoc: {lat: nodes[idx].lat, lon: nodes[idx].lng},
        endLocs: [],
        nodes: nodes,
      };

      for(let conIdx of nodes[idx].conIndexes) {
        q.endLocs.push({lat: nodes[conIdx].lat, lon: nodes[conIdx].lng});
      }
      queue.push(q);
    }
  }
  console.log('- addRequestAllEdgeCosts: ' + nodes.length);
}

function addSaveAllEdgeCosts(nodes, filename) {
  const q = {
    type: 'saveEdgeTimes',
    nodes: nodes,
    filename: filename,
  }
  queue.push(q);
  console.log('- addSaveAllEdgeCosts');
}

function processQueue() {
  if (queue.length > 0) {
    const q = queue.shift();

    switch(q.type) {
      case 'node_lv0':
      case 'node_lv1':
      case 'node_lv2':
        requestEdgeTimes(q);
        break;
      case 'saveEdgeTimes':
        saveEdgeTimes(q);
        break;
      case 'loc_lv0':
      case 'loc_lv1':
      case 'loc_lv2':
        requestLocTimes(q);
        break;
      case 'saveLocTimes':
        saveLocTimes(q);
        break;
      case 'pt_lv0':
      case 'pt_lv1':
      case 'pt_lv2':
        requestPtTimes(q);
        break;
      case 'savePtTimes':
        savePtTimes(q);
        break;
    }
  }
  else {
    clearInterval(timerSec);
  }
}

function getJsonStr(locations) {
  const json = {locations: locations, costing: 'auto'};
  let str = 'https://matrix.mapzen.com/one_to_many?json=';
  str += JSON.stringify(json);
  str += '&api_key=' + apiKeyTimeMatrix;
  return str;
}

function requestPtTimes(q) {
  // q = {type, origin, pts, indexes, orgIdx, segIdx, pts10}
  //console.log(q);
  let locations = [];
  locations.push({lat: q.origin.lat, lon: q.origin.lng});
  for(let loc of q.pts) locations.push({lat: loc.lat, lon: loc.lng});
  //console.log(locations);

  request(getJsonStr(locations), function (error, response, ret) {
    ret = JSON.parse(ret);
    //console.log(ret);

    for(let idx = 1; idx < ret.one_to_many[0].length; idx++) {
      q.pts10[q.orgIdx].ctlPt[q.indexes[idx - 1]].time = ret.one_to_many[0][idx].time;
    }
  });

  console.log('processed: ' + q.type + ' ' + q.orgIdx + ' ' + q.segIdx);
}

function savePtTimes(q) {
  saveTextAsFile(q.pts, q.filename);
}

function requestLocTimes(q) {
  // q = {type, loc, index}
  const locations = q.loc;

  //console.log(getJsonStr(locations));

  request(getJsonStr(locations), function (error, response, ret) {
    ret = JSON.parse(ret);

    if (!ret.one_to_many) {
      console.log('null result.');
    }
    else {
      for(let idx = 1; idx < ret.one_to_many[0].length; idx++) {
        locations[idx].time = ret.one_to_many[0][idx].time;
      }
    }
  });

  console.log('processed: ' + q.type + ' ' + q.index);
}

function saveLocTimes(q) {
  saveTextAsFile(q.locs, q.filename);
}

function requestEdgeTimes(q) {
  let locations = [];
  locations.push(q.startLoc);
  for(let loc of q.endLocs) locations.push(loc);

  request(getJsonStr(locations), function (error, response, ret) {
    ret = JSON.parse(ret);

    q.nodes[q.index].endTimes = [];

    for(let idx = 1; idx < ret.one_to_many[0].length; idx++) {
      q.nodes[q.index].endTimes.push(ret.one_to_many[0][idx].time);
    }
  });
  console.log('processed: ' + q.type + ' ' + q.index);
}

function saveEdgeTimes(q) {
  saveTextAsFile(q.nodes, q.filename);
}

function saveTextAsFile(str, filename) {
  str = JSON.stringify(str);
  filename = './ret/' + (new Date()) + '_' + filename + '.js';
  fs.writeFile(filename, str, function(err) {
    if(err) return console.log(err);
  });
}


