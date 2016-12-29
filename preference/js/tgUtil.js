class TGUtil {

	//
	//
	//
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

	RDPSimp(nodeArr, eps) {
		// Find the point with the maximum distance
		var dmax = 0
		var index = 0
		var startNode = nodeArr[0]
		var endNode = nodeArr[nodeArr.length - 1]

		for(var i = 1; i < nodeArr.length - 1; i++) {
			var testNode = nodeArr[i]

			var d = this.distanceBetweenLineAndPoint(
				startNode.original.lat, startNode.original.lng, 
				endNode.original.lat, endNode.original.lng, 
				testNode.original.lat, testNode.original.lng)

			//console.log(d)
			if (d > dmax) {
				index = i
				dmax = d
			}
		}

		// If max distance is greater than eps, recursively simplify
		if (dmax > eps) {
			// Recursive call
			var result1 = this.RDPSimp(nodeArr.slice(0, index + 1), eps)
			var result2 = this.RDPSimp(nodeArr.slice(index, nodeArr.length), eps)

			// Build the result list
			var results = result1.concat(result2.slice(1))
		}
		else {
			results = [nodeArr[0], nodeArr[nodeArr.length - 1]]
		}
		return results
	}

	distanceBetweenLineAndPoint(L1x, L1y, L2x, L2y, Px, Py) {
		//console.log(L1x + ',' + L1y)
		//console.log(L2x + ',' + L2y)
		//console.log(Px + ',' + Py)
		var t = Math.abs((L2y - L1y) * Px - (L2x - L1x) * Py + L2x * L1y - L2y * L1x)
		var b = Math.sqrt((L2y - L1y) * (L2y - L1y) + (L2x - L1x) * (L2x - L1x))
		//console.log(t + ' / ' + b)
		return t / b
	}


}

Math.randomGaussian = function(mean, standardDeviation) {
 
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
};

$.arrayIntersect = function(a, b)
{
    return $.grep(a, function(i)
    {
        return $.inArray(i, b) > -1;
    });
};

	

