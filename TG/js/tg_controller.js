function TgController($scope, data, api, url) {

	$scope.tg = null;
	$scope.userName = 'Ray バカ';
	$scope.categories = [];
	$scope.categoryName = 'List';
	$scope.catIdx = 0;
	$scope.subcatIdx = 0;
	$scope.isDC = false;
	$scope.TOT = 0; //Type of transportation: car(0), bicycle(1), on foot(2)

	$scope.showCat = true; //false;
	$scope.showAllTOT = false;

	$scope.goToCat = goToCat;
	$scope.selectCat = selectCat;
	$scope.isSelectedCat = isSelectedCat;
	$scope.selectSubCat = selectSubCat;
	$scope.onTOT = onTOT;
	$scope.isTOT = isTOT;
	$scope.selectTOT = selectTOT;

	$scope.signIn = signIn;
	$scope.signOut = signOut;

	$scope.openSetting = openSetting;
	$scope.openFilter = openFilter;
	$scope.goToDC = goToDC;
	$scope.goToEM = goToEM;
	$scope.resetOrigin = resetOrigin;
	$scope.zoom = zoom;

	let selectedCat = -1;
	let dlg = null;



	/**
	 * Entry Point
	 */

	api.getCategories()
	.then((r) => {
		$scope.categories = r.data.cat;
		console.log($scope.categories);
	})
	.catch(catcher);

	initLayout();
	//launchMap();
	initButtons();
	initSearchBar();


	// animation at the beginning.
	const timeInteractionBuffer = 400;

	setTimeout(() => {
		$("#main").animate({opacity: 1}, timeInteractionBuffer * 2);
	}, timeInteractionBuffer * 1.5);


	/*$("#signInModal").draggable({
  	handle: ".modal-header"
  });*/

	/**
	 * Functions
	 */

	function goToCat() {
		$scope.showCat = !$scope.showCat;
	}


	function selectCat(idx) {
		if (selectedCat === idx) selectedCat = -1;
		else selectedCat = idx;
	}

	function isSelectedCat(idx) {
		return (idx === selectedCat);
	}

	function selectSubCat(catIdx, subcatIdx) {
		$scope.catIdx = catIdx;
		$scope.subcatIdx = subcatIdx;

		$scope.categoryName = 
			$scope.categories[$scope.catIdx].cat_sub[$scope.subcatIdx].cat_name;

		console.log('catIdx: ' + catIdx);
		console.log('subcatIdx: ' + subcatIdx);
		//$scope.tg.map.tgLocs.changeType(catIdx, subcatIdx);
	}

	function openSetting() {

	}

	function openFilter() {

	}

	function goToDC() {
		console.log('goToDC!');
		$scope.isDC = true;
		$scope.tg.goToDc('shapePreserving');
	}

	function goToEM() {
		console.log('goToEM!');
		$scope.isDC = false;
		$scope.tg.goToEm();
	}

	function resetOrigin() {
		$scope.tg.initMap();
		$scope.tg.setOriginAsCurrentLocation();
	}

	function onTOT() {
		$scope.showAllTOT = true;
	}

	function isTOT(tot) {
		//let r = ($scope.TOT == tot);
		//console.log('TOT: ' + $scope.TOT + ' tot: ' + tot + ' : ' + r);
		return ($scope.TOT === tot);
		//return r;

		//if (tot === 2) return true;
		//else return false;
	}

	function selectTOT(tot) {
		if ($scope.TOT !== tot) {
			$scope.TOT = tot;
		}
		$scope.showAllTOT = false;
	}

	function zoom(mode) {
		if (mode === 'in') {
			$scope.tg.zoomIn();
		}
		else if (mode === 'out') {
			$scope.tg.zoomOut();
		}
	}

	function getCurrentLocation() {
	  return new Promise((resolve, reject) => {
			const timeOutForGettingLocation = 5000; // 5 sec
			let timeOutTimer;

			if (!navigator.geolocation) {
			  reject('Geolocation is not supported by this browser.');
			}
			else {
			  navigator.geolocation.getCurrentPosition((pos) => {
					clearTimeout(timeOutTimer);
					resolve({
					  lat: pos.coords.latitude,
					  lng: pos.coords.longitude,
					});
			  });

			  timeOutTimer = setTimeout(() => {
						reject('Time out for getting geolocation');
				  }, 
				  timeOutForGettingLocation);
			}
	  });
	}

	function launchMap() {
		getCurrentLocation()
		.then((data) => {
			$scope.tg = new TgApp('ol_map');

			//console.log('got lat & lng from geolocation: ' + data.lat + ', ' + data.lng);
			const seattle = {lat: 47.6115744, lng: -122.343777}
			if ((data.lat > seattle.lat - 1) && (data.lat < seattle.lat + 1) &&
				(data.lng > seattle.lng - 1) && (data.lng < seattle.lng + 1)) {
				//console.log('ok. here is in seattle.');
				$scope.tg.setOriginByOtherLatLng(data.lat, data.lng);
				//user_currentloc.lng = data.lng;
				//user_currentloc.lat = data.lat;

				//console.log('loc_fav:');
				//user_info.loc_fav
				//console.log(user_info.loc_fav);
				//$scope.tg.setFavorites(user_info.loc_fav);

				//$scope.tg.setHomeAndOffice(user_info.loc_home.address, user_info.loc_home.lat, 
				//	user_info.loc_home.lng, user_info.loc_home.address, user_info.loc_office.lat, 
				//	user_info.loc_office.lng);
			}
			else {
				$scope.tg.setOriginAsDefault();
			}
		})
		.catch((error) => {
			console.error(error);
			$scope.tg = new TgApp('ol_map');
			$scope.tg.setOriginAsDefault();
		});
	}

	function signIn() {
  	//if (!dlg) 
  	dlg = angular.element('#signInModal');
    dlg.modal();
    console.log('?');
	}

	function signOut() {

	}

	function initLayout() {
		data.wScreen = $(window).width();
		data.hScreen = $(window).height();
		data.wPanel = 320;

		$("#content_map").css({
			width: data.wScreen - data.wPanel, 
			height: data.hScreen,
		});

		$("#right_panel").css({
			width: data.wPanel, 
			height: data.hScreen,
		});
	}

	function initButtons() {
		const wButton = 58;
		const hButton = 58;
		const wSwitch = 198;
		const wMargin = 5;
		const hMargin = 5;

		// top-left
		$("#btn_gotoCat").css({top: hMargin, left: wMargin * 2});
		$("#map_search").css({top: hMargin, left: wMargin * 3 + wButton});
		$("#content_TOD").css({height: data.hScreen - 200});
		//$(".content_main_textarea_TOD").css({height: data.hScreen - 80});

		// top-right
		$("#btn_sign_in").css({top: hMargin, right: data.wPanel + wMargin * 4 + 2 * wButton});
		$("#btn_sign_up").css({top: hMargin, right: data.wPanel + wMargin * 2 + wButton});
		//$("#howdy_text").css({top: hMargin, right: data.wPanel + wMargin * 2 + wButton});
		$("#btn_gotoSet").css({top: hMargin, right: data.wPanel + wMargin});

		// bottom-left
		$("#btn_switch").css({bottom: hMargin, left: wMargin});
		$("#btn_TOT").css({bottom: hMargin, left: (wMargin * 2) + wSwitch});
		$("#btn_all_TOT0").css({bottom: hMargin, left: (wMargin * 2) + wSwitch});
		$("#btn_all_TOT1").css({bottom: hMargin + hButton, left: (wMargin * 2) + wSwitch});
		$("#btn_all_TOT2").css({bottom: hMargin * 2 + hButton * 2, left: (wMargin * 2) + wSwitch});
		//$("#btn_gotoList").css({bottom: hMargin, left: (wMargin * 3) + wSwitch + wButton});

		// bottom-right
		$("#btn_resetOrigin").css({bottom: hMargin, right: data.wPanel + (wMargin * 2) + wButton});
		$("#btn_zoom").css({bottom: hMargin, right: data.wPanel + wMargin});
	}
	
	function initSearchBar() {
		const input = document.getElementById('search_orig');
		const options = {types: ['geocode']};
		const autocomplete = new google.maps.places.Autocomplete(input, options);
		const whereAmI = function() {
			if (autocomplete.getPlace().geometry && autocomplete.getPlace()) {
				//const address = autocomplete.getPlace().formatted_address;
				const lng = autocomplete.getPlace().geometry.location.lng();
				const lat = autocomplete.getPlace().geometry.location.lat();
			}
		};
		google.maps.event.addListener(autocomplete, 'place_changed', whereAmI);
	}

}

