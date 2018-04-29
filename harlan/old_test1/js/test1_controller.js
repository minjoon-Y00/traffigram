function HarlanTest1Controller($scope, url) {

	$scope.tg = null;
	$scope.model = {
			cbWater: true, cbRoad: true, cbLanduse: true, cbLocation: true, cbPlace: true, 
			cbOrigin: true, cbGrid: false, cbIsochrone: true, cbPerc: false,
			rbOrg: 0, warpingType: 's_gap',
	};
	$scope.origins = null;

	$scope.updateLayers = updateLayers;
	$scope.changeOrg = changeOrg;
	$scope.goToDc = goToDc;
	//$scope.zoomIn = zoomIn;
	//$scope.zoomOut = zoomOut;


	/**
	 * Entry Point
	 */

	$scope.tg = new TgApp('ol_map');
	$scope.tg.setOriginAsDefault();

	$scope.origins = $scope.tg.data.center;

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

	function changeOrg(idx) {
		$scope.tg.setCenter($scope.origins[idx]);
	}

	function zoomIn() {
		//$scope.tg.zoomIn();
	}

	function zoomOut() {
		//$scope.tg.zoomOut();
	}



}

