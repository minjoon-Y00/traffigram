function HarlanController($scope, $window, url) {

	$scope.tg = null;
	$scope.model = {
			cbWater: true, cbRoad: true, cbLanduse: true, cbLocation: true, cbPlace: true, 
			cbOrigin: true, cbGrid: false, cbIsochrone: true, cbPerc: false,
			cbMotorway: true, cbMotorwayLink: true, cbPrimary: true, cbSecondary: true,
			cbTertiary: true, cbResidential: true,
			rbOrg: 0, gridType: 'no_grid', warpingType: 'test1', txRandomCtlPts: 0, txRandomLocs: 10,
			cbOriginal: false, cbTarget: false, cbGAP: false, cbPGAP: true, cbCtlPts: false,
			mapSize: 'size3', mapSizeWidth: 0, mapSizeHeight: 0, isoNum: 3, isoItv: 1,
			centerLat: 0, centerLng: 0,
	};
	$scope.showSettings = true;
	$scope.isDc = false;
	$scope.origins = null;
	$scope.mile = 1;
	$scope.isoNums = [3, 4, 5, 6, 7, 8, 9, 10];
	$scope.isoItvs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 30];
	//$scope.isoItvs = [1, 2, 3, 4, 5, 10, 15, 20, 30];

	$scope.goToEm = goToEm;
	$scope.goToDc = goToDc;
	$scope.toggleSettings = toggleSettings;
	$scope.resetOrigin = resetOrigin;
	$scope.zoomIn = zoomIn;
	$scope.zoomOut = zoomOut;
	$scope.onRandomCtlPts = onRandomCtlPts;
	$scope.onRandomLocs = onRandomLocs;
	$scope.updateRoads = updateRoads;
	$scope.setCenter = setCenter;


	$scope.updateLayers = updateLayers;
	$scope.onChangeMarkers = onChangeMarkers;
	$scope.onChangeWarpingType = onChangeWarpingType;
	$scope.onChangeGridType = onChangeGridType;
	$scope.onChangeMapSize = onChangeMapSize;
	$scope.onManualSize = onManualSize;
	$scope.onChangeIsochrone = onChangeIsochrone;
	$scope.onSaveTimes = onSaveTimes;
	$scope.readSingleFile = readSingleFile;

	$scope.legendMarker1 = null; //"img/markers/marker0_small.png";
	$scope.legendMarker2 = null; //"img/markers/marker1_small.png";

	//$scope.changeOrg = changeOrg;


	/**
	 * Entry Point
	 */

	$scope.tg = new TgApp('ol_map');
	$scope.tg.setOriginAsDefault();

	$scope.origins = $scope.tg.data.center;

	initSearchBar();
	setTimeout(onRandomLocs, 2000);

	/*	
	const appWindow = angular.element($window);
  appWindow.bind('resize', function () {
  	const wScreen = appWindow.width();
  	const hScreen = appWindow.height();
  });*/

/*	$("#randTimeSlider").slider();
	$("#randTimeSlider").on("change", function(slideEvt) {
	  $scope.tg.data.randomTime = slideEvt.value.newValue;
	  $scope.tg.map.tgControl.setRandomTravelTime();
	  $scope.tg.updateLayer();
	});

	$("#stdSlider").slider();
	$("#stdSlider").on("change", function(slideEvt) {
	  $scope.tg.map.tgPerc.std = slideEvt.value.newValue * 0.0001;
	  $scope.tg.updateLayer();
	});*/

	// bottom-right
	/*const wScreen = $(window).width();
	const hScreen = $(window).height();
	const wButton = 58;
	const hButton = 58;
	const wSwitch = 198;
	const wMargin = 5;
	const hMargin = 5;
	const wPanel = 320;*/

	//$("#main").css({width: wScreen - 350, height: hScreen - 350});
	//$("#main").css({bottom: hMargin, right: wPanel + (wMargin * 2) + wButton});


	// bottom: 5, right: 320 + (5 * 2) + 58
	// bottom: 5, right: 320 + 5
	//$("#btn_resetOrigin").css({bottom: hMargin, right: wPanel + (wMargin * 2) + wButton});
	//$("#btn_zoom").css({bottom: hMargin, right: wPanel + wMargin});

	/**
	 * Functions
	 */

	function updateRoads() {

		let dispRoadTypes = [];
		if ($scope.model.cbMotorway) dispRoadTypes.push('motorway');
		if ($scope.model.cbMotorwayLink) dispRoadTypes.push('motorway_link');
		if ($scope.model.cbPrimary) dispRoadTypes.push('primary');
		if ($scope.model.cbSecondary) dispRoadTypes.push('secondary');
		if ($scope.model.cbTertiary) dispRoadTypes.push('tertiary');
		if ($scope.model.cbResidential) dispRoadTypes.push('residential');

		console.log(dispRoadTypes);
		$scope.tg.map.tgRoads.dispRoadTypes = dispRoadTypes;
		$scope.tg.map.tgRoads.render();
	}

	function updateLayers() {
		$scope.tg.turn('water', $scope.model.cbWater);
		$scope.tg.turn('road', $scope.model.cbRoad);
		$scope.tg.turn('landuse', $scope.model.cbLanduse);
		$scope.tg.turn('location', $scope.model.cbLocation);
		$scope.tg.turn('place', $scope.model.cbPlace);
		$scope.tg.turn('origin', $scope.model.cbOrigin);
		$scope.tg.turn('grid', $scope.model.cbGrid);
		$scope.tg.turn('isochrone', $scope.model.cbIsochrone);
		$scope.tg.turn('perc', $scope.model.cbPerc);

		$scope.tg.turn('gridOriginal', $scope.model.cbOriginal);
		$scope.tg.turn('gridTarget', $scope.model.cbTarget);
		$scope.tg.turn('gridGAP', $scope.model.cbGAP);
		$scope.tg.turn('gridPGAP', $scope.model.cbPGAP);
		$scope.tg.turn('gridCtlPts', $scope.model.cbCtrlPts);


		$scope.tg.updateLayer();
	}

	function goToDc() {
		switch($scope.model.warpingType) {
			case 's_gap':
				$scope.tg.goToDc('shapePreserving');
				break;
			case 'gap':
				$scope.tg.goToDc('noIntersection');
				break;
			case 'no_warping':
				$scope.tg.goToDc('noWarping');
				break;
			case 'original':
				$scope.tg.goToDc('originalDC');
				break;		
			case 'test1':
				$scope.tg.goToDc('test1');
				break;
			case 'test2':
				$scope.tg.goToDc('test2');
				break;
		}
		$scope.isDc = true;

		$scope.legendMarker2 = $scope.tg.map.tgLocs.markerImg1;
		$scope.legendMarker1 = $scope.tg.map.tgLocs.markerImg2;
		redrawLegendPxLine();
	}

	function redrawLegendPxLine() {
		console.log('this.pxPerMiles:' + $scope.tg.map.pxPerMiles);

	  const pxPerMiles = $scope.tg.map.pxPerMiles;
	  let px = 0, margin = 0;
	  if (pxPerMiles < 126) {
	  	$scope.mile = 1;
	  	px = pxPerMiles;
	  	margin = 70;
	  }
	  else if (pxPerMiles < 1024 * 2) {
	  	$scope.mile = 0.1;
	  	px = pxPerMiles / 10;
	  	margin = 100;
	  }
	  else {
	  	$scope.mile = 0.01;
	  	px = pxPerMiles / 100;
	  	margin = 120;	
	  }

	  $("#mileLine").css({width: px});
		$("#legend").css({width: px + margin});
	}

	function onChangeWarpingType() {
		if ($scope.isDc) goToDc();
	}

	function onChangeGridType() {
		switch($scope.model.gridType) {
			case 'no_grid':
				$scope.tg.turn('grid', false);
				break;
			case 'show_grid':
				if ($scope.model.warpingType === 'gap') {
					$scope.tg.turn('gridGAP', true);
					$scope.tg.turn('gridPGAP', false);
				}
				else if ($scope.model.warpingType === 'test1') {
					$scope.tg.turn('gridGAP', false);
					$scope.tg.turn('gridPGAP', true);
				}
				$scope.tg.turn('grid', true);
				break;
			case 'show_all_grid':
				$scope.tg.turn('gridGAP', true);
				$scope.tg.turn('gridPGAP', true);
				$scope.tg.turn('grid', true);
				break;
		}
		$scope.tg.turn('gridCtlPts', $scope.model.cbCtrlPts);
		$scope.tg.updateLayer();
	}

	function goToEm() {
		$scope.tg.goToEm();
		$scope.isDc = false;
	}

	function toggleSettings() {
		$scope.showSettings = !$scope.showSettings;
	}

	function resetOrigin() {

	}

	function zoomIn() {
		$scope.tg.zoomIn();
		setTimeout(onRandomLocs, 2000);
		setTimeout(redrawLegendPxLine, 2000);
	}

	function zoomOut() {
		$scope.tg.zoomOut();
		setTimeout(onRandomLocs, 2000);
		setTimeout(redrawLegendPxLine, 2000);		
	}

	function onRandomCtlPts() {
		$scope.tg.randomCtlPts(Number($scope.model.txRandomCtlPts));
	}

	function onRandomLocs() {
		$scope.tg.randomLocs(Number($scope.model.txRandomLocs));
	}

	function onChangeMarkers() {
		$scope.tg.changeMarkers();
		$scope.legendMarker2 = $scope.tg.map.tgLocs.markerImg1;
		$scope.legendMarker1 = $scope.tg.map.tgLocs.markerImg2;
	}

	function onChangeMapSize() {

		let width, height;
		switch($scope.model.mapSize) {
			case 'size1':
				width = 960;
				height = 720;
				break;
			case 'size2':
				width = 800;
				height = 600;
				break;
			case 'size3':
				width = 640;
				height = 480;
				break;
		}
		//$("#ol_map").css({width: width, height: height});
		$("#main").css({width: width, height: height});
		$("#map_search").css({top: height + 50});
		$("#legend").css({top: height - 100});

		$scope.tg.map.Redraw(width, height);
	}

	function onManualSize() {
		if ($scope.model.mapSizeWidth && $scope.model.mapSizeHeight) {
			$("#main").css({width: $scope.model.mapSizeWidth, height: $scope.model.mapSizeHeight});
			$("#map_search").css({top: height + 50});
			$scope.tg.map.Redraw();
		}
	}

	function onChangeIsochrone() {
		const opt = {num: $scope.model.isoNum, interval: $scope.model.isoItv * 60};
		$scope.tg.map.tgIsochrone.drawIsochrone(opt);
	}

	function setCenter() {
		const opt = {lat: Number($scope.model.centerLat), lng: Number($scope.model.centerLng)};
		$scope.tg.setCenter(opt);
	}

	function onSaveTimes() {
		const fileNameToSaveAs = 'times.json';
		const pts = $scope.tg.map.tgControl.controlPoints;
		const mid = (pts.length - 1) / 2;

		let str = '[';
		for(let i = 0; i < mid; ++i) str += pts[i].travelTime + ',';
		str += 'null,';
		for(let i = mid + 1; i < pts.length - 1; ++i) str += pts[i].travelTime + ',';		 
		str += pts[pts.length - 1].travelTime + ']';
		// console.log(str);
		
	  const textToWrite = str;
	  //const textToWrite = JSON.stringify(str);
	  const textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	  let downloadLink = document.createElement("a");
	  downloadLink.download = fileNameToSaveAs;
	  downloadLink.innerHTML = "Download File";
	  downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
	  downloadLink.click();
	}

  /*	
  function changeOrg(idx) {
		$scope.tg.setCenter($scope.origins[idx]);
	}*/

	function initSearchBar() {
		const input = document.getElementById('search_orig');
		const options = {types: ['geocode']};
		const autocomplete = new google.maps.places.Autocomplete(input, options);
		const whereAmI = function() {
			if (autocomplete.getPlace().geometry && autocomplete.getPlace()) {
				//const address = autocomplete.getPlace().formatted_address;
				const lng = autocomplete.getPlace().geometry.location.lng();
				const lat = autocomplete.getPlace().geometry.location.lat();
				$scope.tg.setCenter({lat: lat, lng: lng});
			}
		};
		google.maps.event.addListener(autocomplete, 'place_changed', whereAmI);
	}

	function readSingleFile(evt) {
    //Retrieve the first (and only!) File from the FileList object
    const f = evt.target.files[0]; 

    if (f) {
      const r = new FileReader();
      r.onload = function(e) { 
        const contents = e.target.result;
        let times = JSON.parse(contents);
        $scope.tg.map.tgControl.setTimesByJson(times);

        if ($scope.isDc) goToDc();
      }
      r.readAsText(f);
    } else { 
      alert("Failed to load file");
    }
  }

  document.getElementById('fileinput').addEventListener('change', readSingleFile, false);


}

