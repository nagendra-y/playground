var playground = angular.module('MesiboPlayground', []);

playground.directive('customAutofocus', function($timeout) {
	return{
		restrict: 'A',

		link: function(scope, element, attrs){
			scope.$watch(function(){
				return scope.$eval(attrs.customAutofocus);
			},function (newValue){
				if (newValue === true){
					$timeout(function() {
						element[0].focus();
					});
					//use focus function instead of autofocus attribute to avoid cross browser problem. And autofocus should only be used to mark an element to be focused when page loads.
				}
			});
		}
	};
})

playground.controller('AppController', ['$scope', '$window', '$anchorScroll', function ($scope, $window, $anchorScroll) {
	$scope.root = "https://api.mesibo.com/api.php";
	$scope.token = "";

	$scope.apis = [
		{	
			"op" : "useradd",
			"title" : "Add a User or Regenerate a User Access Token",
			"description": "To enable real-time communication between your users, you need to let mesibo know about each of your users. Mesibo will create an access token for each user and give it to you which you can send it to your users. Your user can then use this access token in Mesibo Real-time APIs using setAccessToken function.",

			"params": [ 
				{
					"name": "addr",
					"description": "User Address (e.g phone number, email address, etc.)",
					"type": "String",
					"required": true,
					"default": ""
				},
				{
					"name": "appid",
					"description": "Custom Application ID",
					"alt":
					{
						"Android": 
						{
							"description": "Android Package Name. The generated token will be applicable for the app having this package name only",
							"placeholder": "Example, com.mesibo.androidapp"
						},
						"iOS": 
						{ 
							"description": "iOS Bundle ID. The generated token will be applicable for the app having this Bundle id only",
							"placeholder": "Example, com.mesibo.iosapp"
						},

						"Other": {
							"description":"In case of other platforms like Web, Desktop, etc. Pass any unique string. Ensure that same need to be passed to setAppName function",
							"placeholder": "Example, web"
						},
					},
					"platforms": ["Android", "iOS", "Other"],
					"type": "String",
					"required": true,
					"default": ""
				},
				{
					"name": "expiry",
					"description": "In minutes, default 1 year",
					"type": "Number",
					"required": false,
					"default": 525600 
				},

				{
					"name": "active",
					"description": "Enable user, default 1 (active)",
					"type": "Number",
					"required": false,
					"default": 1
				},

				{
					"name": "groups",
					"description": "Maximum Groups",
					"type": "Number",
					"required": false,
				}
			],

			"response" : {"OK": "Returns a user object on success"}
		}	

	];

	$scope.apis[1] = {"op":"useredit", "title": "Edit a User", "parameters": []}; 
	$scope.apis[2] = {"op" : "userdel", "title": "Delete a User", "parameters": []};

	$scope.getRequestUrl = function(api){
		if(!api)
			return;

		var root = $scope.root;
		if(!root)
			return;

		var url = "";
		if(root && api.op)
			url = root + "?op="+ api.op;

		var params = api.params;
		if(!params)
			return url;

		for(var i=0; i<params.length; i++){
			var param = params[i].name;
			var value = "";

			var param_value = document.getElementById("input-param-"+ param);
			if(param_value)
				value = param_value.value;

			if(!(value == undefined || value == null || value == NaN)){
				var pv = param + "=" + value;
				url = url + "&" + pv;
			}
		}

		url = url + "&token=" + $scope.token;
		return url; 
	}

	$scope.updateRequestUrl = function(api, param){
		if(!(api && param))
			return;

		//Use regexp to replace param=value part in the url

		var url = $scope.getRequestUrl(api);
		if(!url)
			return;

		var eleUrl = document.getElementById("request-url-"+ api.op);
		if(!eleUrl)
			return;
		
		eleUrl.value = url;
	}

	$scope.updateDescription = function(param, platform){
		if(!(param && platform))
			return;

		if(!param.name)
			return;

		var e = document.getElementById("platform-menu-"+ param.name);
		if(!e)
			return;
		e.textContent = platform;

		var alt = param.alt;
		if(!alt)
			return;

		var newDescription = alt[platform].description;
		if(!newDescription)
			return;

		var param_description = document.getElementById("param-description-"+ param.name);
		if(!param_description)
			return;

		param_description.innerHTML = newDescription;
		console.log("updateDescription", newDescription, param_description);
		
		if(document.getElementById("input-param-"+ param.name)){
			if(alt[platform].placeholder)
				document.getElementById("input-param-"+ param.name).placeholder = alt[platform].placeholder;
		}
			
	}
	
	$scope.setToken = function(){
		var t = document.getElementById("apptoken");
		if(!(t && t.value))
			return;

		$scope.token = t.value;
	}

	$scope.copyRequestUrl = function(api){
		if(!(api && api.op))
			return;

		//https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
		/* Get the text field */
		var copyText = document.getElementById("request-url-"+ api.op);

		/* Select the text field */
		copyText.select();
		copyText.setSelectionRange(0, 99999); /* For mobile devices */

		/* Copy the text inside the text field */
		document.execCommand("copy");

		/* Alert the copied text */
		console.log("Copied: " + copyText.value);
	}

	$scope.openRequestUrl = function(api){
		var request_url = $scope.getRequestUrl(api);
		if(!request_url)
			return;
		window.open(request_url, '_blank');
	}


}]);

