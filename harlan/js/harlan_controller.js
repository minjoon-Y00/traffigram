function HarlanController($scope, $window, url) {

	$scope.tg = null;
	$scope.model = {
			cbWater: true, cbRoad: true, cbLanduse: true, cbLocation: true, cbPlace: true, 
			cbOrigin: true, cbGrid: false, cbIsochrone: true, cbPerc: false,
			rbOrg: 0, warpingType: 's_gap',
	};
	$scope.showSettings = true;
	$scope.origins = null;

	$scope.updateLayers = updateLayers;
	$scope.goToDc = goToDc;

	$scope.toggleSettings = toggleSettings;
	$scope.resetOrigin = resetOrigin;
	$scope.zoomIn = zoomIn;
	$scope.zoomOut = zoomOut;

	//$scope.changeOrg = changeOrg;


	/**
	 * Entry Point
	 */

	$scope.tg = new TgApp('ol_map');
	$scope.tg.setOriginAsDefault();

	$scope.origins = $scope.tg.data.center;

	const appWindow = angular.element($window);

  appWindow.bind('resize', function () {
  	console.log('Resized your browser');
  	console.log(appWindow.height());
  	console.log(appWindow.width());

  	const wScreen = appWindow.width();
  	const hScreen = appWindow.height();

		//$("#main").css({width: wScreen - 350, height: hScreen - 350});

  });

	$("#randTimeSlider").slider();
	$("#randTimeSlider").on("change", function(slideEvt) {
	  $scope.tg.data.randomTime = slideEvt.value.newValue;
	  $scope.tg.map.tgControl.setRandomTravelTime();
	  $scope.tg.updateLayer();
	});

	$("#stdSlider").slider();
	$("#stdSlider").on("change", function(slideEvt) {
	  $scope.tg.map.tgPerc.std = slideEvt.value.newValue * 0.0001;
	  $scope.tg.updateLayer();
	});

	// bottom-right
	const wScreen = $(window).width();
	const hScreen = $(window).height();

	const wButton = 58;
	const hButton = 58;
	const wSwitch = 198;
	const wMargin = 5;
	const hMargin = 5;
	const wPanel = 320;

	//$("#main").css({width: wScreen - 350, height: hScreen - 350});
	//$("#main").css({bottom: hMargin, right: wPanel + (wMargin * 2) + wButton});


	// bottom: 5, right: 320 + (5 * 2) + 58
	// bottom: 5, right: 320 + 5
	//$("#btn_resetOrigin").css({bottom: hMargin, right: wPanel + (wMargin * 2) + wButton});
	//$("#btn_zoom").css({bottom: hMargin, right: wPanel + wMargin});

	/**
	 * Functions
	 */

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
		}
	}

	function toggleSettings() {
		$scope.showSettings = !$scope.showSettings;
	}

	function resetOrigin() {

	}

	function zoomIn() {
		$scope.tg.zoomIn();
		console.log('?');
	}

	function zoomOut() {
		$scope.tg.zoomOut();
	}

  /*	
  function changeOrg(idx) {
		$scope.tg.setCenter($scope.origins[idx]);
	}*/

}

