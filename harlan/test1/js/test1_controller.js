function HarlanTest1Controller($scope, url) {

	$scope.tg = null;
	$scope.model = {
			cbWater: true, cbRoad: true, cbLanduse: true, cbLocation: true, cbPlace: true, 
			cbOrigin: true, cbIsochrone: true, rbOrg: 0,
	};
	$scope.origins = null;

	$scope.updateLayers = updateLayers;
	$scope.changeOrg = changeOrg;
	//$scope.zoomIn = zoomIn;
	//$scope.zoomOut = zoomOut;



	/**
	 * Entry Point
	 */

	$scope.tg = new TgApp('ol_map');
	$scope.tg.setOriginAsDefault();

	$scope.origins = $scope.tg.data.center;




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
		$scope.tg.turn('isochrone', $scope.model.cbIsochrone);

		$scope.tg.updateLayer();
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

