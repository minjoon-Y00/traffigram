class TgUtil {
	constructor() {
		// do nothing
	}

	distance(lat1, lng1, lat2, lng2) {
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

	D2(lat1, lng1, lat2, lng2) {
	  return Math.sqrt((lat1 - lat2)*(lat1 - lat2) + (lng1 - lng2)*(lng1 - lng2))
	}

	D2_s(lat1, lng1, lat2, lng2) {
	  return (lat1 - lat2)*(lat1 - lat2) + (lng1 - lng2)*(lng1 - lng2)
	}

	getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min)) + min
	}

	// clone object
	clone(obj) {
  	return JSON.parse(JSON.stringify(obj))
	}

	degrees(radians) {
	  return radians * 180 / Math.PI
	};

	median(values) {
    values.sort( function(a,b) {return a - b;} );
    const half = Math.floor(values.length/2);

    if(values.length % 2) return values[half];
    else return (values[half-1] + values[half]) / 2.0;
	}

	average(values) {
		let sum = 0;
		for(let v of values) sum += v;
		if (values.length > 0) return sum / values.length;
		else return 0;
	}

	// i_sLat, i_sLng, i_eLat, i_eLng, j_sLat, j_sLng, j_eLat, j_eLng
	intersects(a, b, c, d, p, q, r, s) {
	  var det, gamma, lambda
	  det = (c - a) * (s - q) - (r - p) * (d - b)
	  if (det === 0) {
	    return false
	  } else {
	    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det
	    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det
	    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1)
	  }
	}

	intersectRect(r1, r2) {
	  return !(r2.left > r1.right || 
	           r2.right < r1.left || 
	           r2.top > r1.bottom ||
	           r2.bottom < r1.top);
	}

	RDPSimp3D(point3DArray, eps) {
		for(let index = 0; index < point3DArray.length; index++) {
			for(let index2 = 0; index2 < point3DArray[index].length; index2++) {
				point3DArray[index][index2] = this.RDPSimp1D(point3DArray[index][index2], eps);
			}
		}
		return point3DArray;
	}

	RDPSimp2D(point2DArray, eps) {
		for(let index = 0; index < point2DArray.length; index++) {
			//console.log('before: ' + point2DArray[index].length);
			point2DArray[index] = this.RDPSimp1D(point2DArray[index], eps);
			//console.log('after: ' + point2DArray[index].length);
		}
		return point2DArray;
	}

	// pointArray: [[lng, lat], ..., [lng, lat]]
	RDPSimp1D(pointArray, eps) {
		// Find the point with the maximum distance

		let dmax = 0;
		let index = 0;
		const startPoint = pointArray[0];
		const endPoint = pointArray[pointArray.length - 1];

		//console.log(startPoint);
		//console.log(endPoint);

		for(let i = 1; i < pointArray.length - 1; i++) {
			const testPoint = pointArray[i];
			const d = this.distanceBetweenLineAndPoint(startPoint, endPoint, testPoint);

			if (d > dmax) {
				index = i
				dmax = d
			}
		}

		// If max distance is greater than eps, recursively simplify
		if (dmax > eps) {
			// Recursive call
			const result1 = this.RDPSimp1D(pointArray.slice(0, index + 1), eps);
			const result2 = this.RDPSimp1D(pointArray.slice(index, pointArray.length), eps);

			// Build the result list
			return result1.concat(result2.slice(1));
		}
		else {
			return [startPoint, endPoint];
		}
	}

	RDPSimp3DLoop(point3DArray, eps) {
		for(let index = 0; index < point3DArray.length; index++) {
			point3DArray[index] = this.RDPSimp2DLoop(point3DArray[index], eps);
		}
		return point3DArray;
	}

	RDPSimp2DLoop(point2DArray, eps) {
		for(let index = 0; index < point2DArray.length; index++) {

			const nodes = point2DArray[index];
			const pivot = nodes[0];
			let max = 0.0;
			let maxK = 0;
			for(let k = 1; k < nodes.length; k++) {
				const d = this.distance(nodes[0][0], nodes[0][1], nodes[k][0], nodes[k][1])
				//const d = this.D2_s(nodes[0][0], nodes[0][1], nodes[k][0], nodes[k][1])
				if (d > max) {
					max = d;
					maxK = k;
				}
			}

			/*const distance = 0.1;
			if (max < distance) {
				point2DArray[index] = [];
				continue;
			}*/

			//console.log('max: ' + max);

			let nodes1 = nodes.slice(0, maxK + 1);
			let nodes2 = nodes.slice(maxK, nodes.length);

			let simplifiedNodes1 = this.RDPSimp1D(nodes1, eps);
			let simplifiedNodes2 = this.RDPSimp1D(nodes2, eps);
			simplifiedNodes1.pop();

			//console.log('before: ' + point2DArray[index].length);
			point2DArray[index] = simplifiedNodes1.concat(simplifiedNodes2);
			//console.log('after: ' + point2DArray[index].length);

			//point2DArray[index] = [];
		}
		return point2DArray;
	}

	distanceBetweenLineAndPoint(L1, L2, P) {
		const t = 
				Math.abs(
						(L2[1] - L1[1]) * P[0] - (L2[0] - L1[0]) * P[1] + 
						L2[0] * L1[1] - L2[1] * L1[0]);
		const b = 
				Math.sqrt(
						(L2[1] - L1[1]) * (L2[1] - L1[1]) + 
						(L2[0] - L1[0]) * (L2[0] - L1[0]));
		return t / b
	}

	/*distanceBetweenLineAndPoint(L1x, L1y, L2x, L2y, Px, Py) {
		//console.log(L1x + ',' + L1y)
		//console.log(L2x + ',' + L2y)
		//console.log(Px + ',' + Py)
		var t = Math.abs((L2y - L1y) * Px - (L2x - L1x) * Py + L2x * L1y - L2y * L1x)
		var b = Math.sqrt((L2y - L1y) * (L2y - L1y) + (L2x - L1x) * (L2x - L1x))
		//console.log(t + ' / ' + b)
		return t / b
	}*/

	abByFFT(p, type, d) {
		const a = function(k, angs, ts, r) {
			let sum = 0;
			for(let i = 0; i < angs.length; i++) {
				sum += Math.sin(k * (ts[i] + angs[i] * r / 2)) - Math.sin(k * (ts[i] - angs[i] * r / 2));
			}
			return sum / (Math.PI * k * r);
		}

		const b = function(k, angs, ts, r) {
			let sum = 0;
			for(let i = 0; i < angs.length; i++) {
				sum += Math.cos(k * (ts[i] + angs[i] * r / 2)) - Math.cos(k * (ts[i] - angs[i] * r / 2));
			}
			return -sum / (Math.PI * k * r);
		}

		const D2 = function(x1, y1, x2, y2) {
		  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
		}

		const lenVector = function(x, y) {
			return Math.sqrt(x * x + y * y);
		}

		// arclength parameterization
		const numPoints = p.length;
		const r = Math.PI / 50;

		let dists = new Array(numPoints);
		for(let i = 0; i < numPoints - 1; i++) {
			dists[i] = (D2(p[i][type].lat, p[i][type].lng, p[i + 1][type].lat, p[i + 1][type].lng));
		}
		dists[numPoints - 1] = (D2(p[numPoints - 1][type].lat, p[numPoints - 1][type].lng, p[0][type].lat, p[0][type].lng));

		let sumDist = 0;
		for(let i = 0; i < numPoints; i++) {
			sumDist += dists[i];
		}

		let ts = new Array(numPoints);
		ts[0] = 0;
		let partialDist = 0;

		for(let i = 0; i < numPoints - 1; i++) {
			partialDist += dists[i];
			ts[i + 1] = partialDist / sumDist;
		}

		// calculate angles
		let vs = new Array(numPoints);
		for(let i = 0; i < numPoints; i++) vs[i] = new Array(2);

		for(let i = 0; i < numPoints - 1; i++) {
			vs[i][0] = p[i][type].lat - p[i + 1][type].lat;
			vs[i][1] = p[i][type].lng - p[i + 1][type].lng;
		}
		vs[numPoints - 1][0] = p[numPoints - 1][type].lat - p[0][type].lat;
		vs[numPoints - 1][1] = p[numPoints - 1][type].lng - p[0][type].lng;

		let angs = new Array(numPoints);

		angs[0] = Math.acos(
				vs[0][0] * vs[numPoints - 1][0] + vs[0][1] * vs[numPoints - 1][1] / 
				(lenVector(vs[0][0], vs[0][1]) * lenVector(vs[numPoints - 1][0], vs[numPoints - 1][1])));

		for(let i = 1; i < numPoints; i++) {
			angs[i] = Math.acos(
					vs[i][0] * vs[i - 1][0] + vs[i][1] * vs[i - 1][1] / 
					(lenVector(vs[i][0], vs[i][1]) * lenVector(vs[i - 1][0], vs[i - 1][1])));
		}

		let as = new Array(d - 1);
		let bs = new Array(d - 1);
		for(let k = 1; k <= d; k++) {
			as[k - 1] = a(k, angs, ts, r);
			bs[k - 1] = b(k, angs, ts, r);
		}

		//console.log('type: ' + type);
		//console.log('dists: ');
		//console.log(dists);
		//console.log('ts: ');
		//console.log(ts);
		//console.log('angs: ');
		//console.log(angs);

		//console.log('as: ');
		//console.log(as);
		//console.log('bs: ');
		//console.log(bs);

		return {as:as, bs:bs};
	}

	saveTextAsFile(textToWrite, fileNameToSaveAs) {
	  textToWrite = JSON.stringify(textToWrite)
	  var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'})
	  var downloadLink = document.createElement("a")
	  downloadLink.download = fileNameToSaveAs
	  downloadLink.innerHTML = "Download File"
	  downloadLink.href = window.URL.createObjectURL(textFileAsBlob)

	  /*
	  if (window.webkitURL != null) {
	    // Chrome allows the link to be clicked
	    // without actually adding it to the DOM.
	    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob)
	  }
	  else {
	    // Firefox requires the link to be added to the DOM
	    // before it can be clicked.
	    downloadLink.href = window.URL.createObjectURL(textFileAsBlob)
	    downloadLink.onclick = destroyClickedElement
	    downloadLink.style.display = "none"
	    document.body.appendChild(downloadLink)
	  }
	  */
	  downloadLink.click()
	}

	randomGaussian(mean, standardDeviation) {
	  //mean = defaultTo(mean, 0.0);
	  //standardDeviation = defaultTo(standardDeviation, 1.0);

	  if (Math.randomGaussian.nextGaussian !== undefined) {
	    var nextGaussian = Math.randomGaussian.nextGaussian;
	    delete Math.randomGaussian.nextGaussian;
	    return (nextGaussian * standardDeviation) + mean;
	  } else {
	    var v1, v2, s, multiplier;
	    do {
	        v1 = 2 * Math.random() - 1; // between -1 and 1
	        v2 = 2 * Math.random() - 1; // between -1 and 1
	        s = v1 * v1 + v2 * v2;
	    } while (s >= 1 || s == 0);
	    multiplier = Math.sqrt(-2 * Math.log(s) / s);
	    Math.randomGaussian.nextGaussian = v2 * multiplier;
	    return (v1 * multiplier * standardDeviation) + mean;
	  }
	}

}
module.exports = new TgUtil();