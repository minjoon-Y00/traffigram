angular.module('harlanTest1App', [])
  .controller('harlanTest1Controller', HarlanTest1Controller)
	.constant('url', 'https://citygramsound.com:4349');

function TgApi($http, url) {
	return {
		getCategories: function() {
			return $http.post(url + '/tod_get_cat', {});
		},
		saveFile: function(fileUrl, data) {
			return $http.post(url + '/saveFile', {cache: false, fileUrl:fileUrl, data:data})
		},
	}
}

/*function TgData() {
	let wScreen;
	let hScreen;
	return {
		wScreen, 
		hScreen,
	}
}*/

function catcher(err) {
	console.log(err);
}