var playground = angular.module('MesiboPlayground', []);

playground.controller('AppController', ['$scope', '$window', '$anchorScroll', function ($scope, $window, $anchorScroll) {
	$scope.root = "https://api.mesibo.com/api.php";
	$scope.apis = [];

	var a = {};
	a.op = "useradd";
	a.title = "Add a User or Regenerate a User Access Token";
	a.description = "To enable real-time communication between your users, you need to let mesibo know about each of your users. Mesibo will create an access token for each user and give it to you which you can send it to your users. Your user can then use this access token in Mesibo Real-time APIs using setAccessToken function.";
	var params = [];
	params[0] = {
		"name": "addr",
		"description": "User Address (e.g phone number, email address, etc.)",
		"type": "String",
		"required": true,
		"default": ""
	};
	params[1] = {
		"name": "appid",
		"description": "Android package name or iOS Bundle id. The generated token will be applicable for the app having this package name or Bundle id only. For all other platforms, you can pass any unique string, and the same need to be passed to setAppName function.",
		"type": "String",
		"required": true,
		"default": ""
	};
	params[2] = {
		"name": "expiry",
		"description": "In minutes, default 1 year",
		"type": "Number",
		"required": false,
		"default": 525600 
	};
	
	params[3] = {
		"name": "active",
		"description": "Enable user, default 1 (active)",
		"type": "Number",
		"required": false,
		"default": 1
	};

	params[4] = {
		"name": "groups",
		"description": "Maximum Groups",
		"type": "Number",
		"required": false,
	};
	a.params = params;

	a.response = {"OK": "Returns a user object on success"}

	$scope.apis[0] = a; 
	$scope.apis[1] = {"op":"useredit", "title": "Edit a User", "parameters": []}; 
	$scope.apis[2] = {"op" : "userdel", "title": "Delete a User", "parameters": []}; 
}]);


