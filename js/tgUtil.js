class TGUtil {

	//
	//
	//
	saveTextAsFile(textToWrite, fileNameToSaveAs) {
	  textToWrite = JSON.stringify(textToWrite);
	  var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	  var downloadLink = document.createElement("a");
	  downloadLink.download = fileNameToSaveAs;
	  downloadLink.innerHTML = "Download File";
	  if (window.webkitURL != null)
	  {
	    // Chrome allows the link to be clicked
	    // without actually adding it to the DOM.
	    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	  }
	  else
	  {
	    // Firefox requires the link to be added to the DOM
	    // before it can be clicked.
	    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
	    downloadLink.onclick = destroyClickedElement;
	    downloadLink.style.display = "none";
	    document.body.appendChild(downloadLink);
	  }
	  downloadLink.click();
	}

	distance(lat1, lng1, lat2, lng2) {
	  //var R = 6371; // km
	  var R = 3959; // 6371*0.621371; // miles
	  var dLat = (lat2 - lat1) * Math.PI / 180;
	  var dLng = (lng2 - lng1) * Math.PI / 180; 
	  var a = Math.sin(dLat / 2) * 
	          Math.sin(dLat / 2) +
	          Math.cos(lat1 * Math.PI / 180 ) * 
	          Math.cos(lat2 * Math.PI / 180 ) * 
	          Math.sin(dLng / 2) * 
	          Math.sin(dLng / 2);
	  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
	  var d = R * c;
	  return d;
	}

	D2(lat1, lng1, lat2, lng2) {
	  return Math.sqrt((lat1 - lat2)*(lat1 - lat2) + (lng1 - lng2)*(lng1 - lng2));
	}

	getRandomInt(min, max) {
	  return Math.floor(Math.random() * (max - min)) + min;
	}

	// clone object
	clone(obj) {
  	return JSON.parse(JSON.stringify(obj));
	}

	degrees(radians) {
	  return radians * 180 / Math.PI;
	};
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