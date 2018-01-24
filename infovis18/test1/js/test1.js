angular.module('infovis18Test1App', [])
  .controller('infovis18Test1Controller', Infovis18Test1Controller)
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