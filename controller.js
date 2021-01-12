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

const RESULT_OK = 0;
const RESULT_FAIL = -1;

const RESULT_FAIL_APPID_NAN = 11;
const RESULT_FAIL_APPID_DOTS = 12;

playground.controller('AppController', ['$scope', '$window', '$compile', '$timeout', '$anchorScroll', function ($scope, $window, $compile, $timeout, $anchorScroll) {
	$scope.root = "https://api.mesibo.com/api.php";
	$scope.token = "";
	$scope.selected_platform = {};

	$scope.apis = [];

	$scope.apiJson = [
		{	
			"op" : "useradd",
			"type": "user",
			"title" : "Add a User or Regenerate a User Access Token",
			"description": "To enable real-time communication between your users, you need to let mesibo know about each of your users. Mesibo will create an access token for each user and give it to you which you can send it to your users. Your user can then use this access token in Mesibo Real-time APIs using setAccessToken function.",
			"requestUrl": "",
			"params": [ 
				{
					"name": "addr",
					"description": "User Address (e.g phone number, email address, etc.)",
					"type": "string",
					"required": true,
					"value": ""
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
					"type": "string",
					"required": true,
					"value": ""
				},
				{
					"name": "expiry",
					"description": "In minutes, default 1 year",
					"type": "number",
					"required": false,
					"value": 525600 
				},

				{
					"name": "active",
					"description": "Enable user, default 1 (active)",
					"type": "number",
					"required": false,
					"value": 1,
					"valueList": [1, 0]
				},
			],
		},

		{	
			"op" : "userset",
			"type": "user",
			"title" : "Edit a User",
			"description": "Edit an existing user using the `UID` obtained from `useradd` operation.",
			"requestUrl": "",
			"params": [ 
				{
					"name": "uid",
					"description": "User ID obtained in add user operation",
					"type": "number",
					"required": true,
					"value": ""
				},
				{
					"name": "flag",
					"description": "Flags",
					"type": "number",
					"required": true,
					"value": 0 
				},

				{
					"name": "active",
					"description": "Enable user, default 1 (active)",
					"type": "number",
					"required": false,
					"value": 1,
					"valueList": [1, 0]
				},
			]
		},

		{	
			"op" : "userdel",
			"type": "user",
			"title" : "Delete a User",
			"description": "Delete an existing user using UID obtained from add user operation",
			"requestUrl": "",
			"params": [ 
				{
					"name": "uid",
					"description": "User ID obtained in add user operation",
					"type": "number",
					"required": true,
					"value": 0
				}
			]
		},

		{	
			"op" : "usersget",
			"type": "user",
			"title" : "Get Users",
			"description": "Get users for an application. This API is only for development purpose only and hence maximum 20 users will be returned. You should store your users locally instead of obtaining from the mesibo.",
			"requestUrl": "",
			"params": [ 
				{
					"name": "addr",
					"description": "get users marching address. Wildcard (*) allowed",
					"type": "string",
					"required": true,
					"value": ""
				},
				{
					"name": "count",
					"description": "Max number of users to get. Max 20",
					"type": "number",
					"required": true,
					"value": 20
				},
			]
		},


		{	
			"op" : "groupadd",
			"type": "group",
			"title" : "Create a Group",
			"description": "Create a group to enable real-time group communication between your users. Mesibo will create a group ID (GID) which you can use to add and remove members. Your users can use GID in various real-time API to send messages to the group. <br><br> Group Flags: <br> <ul> <li>0 - normal group, only members can send</li><li>1 - only selected members can send (refer add members API)</li><li>0x20 - received by one member in the round-robin fashion</li><li>0x40 - do no store group messages</li><li>0x80 - loop back to sender</li></ul>",	
			"requestUrl": "",
			"params": [ 
				{
					"name": "name",
					"description": "Group Name",
					"type": "string",
					"required": false,
					"value": ""
				},
				{
					"name": "flag",
					"description": "Group Flags",
					"type": "string",
					"required": true,
					"value": "0",
					"valueList": ["0", "1", "0x20", "0x40", "0x80"]
				},
				{
					"name": "expiry",
					"description": "In minutes, default 1 year",
					"type": "number",
					"required": false,
					"value": 525600 
				},
				{
					"name": "expiryext",
					"description": "Auto extend expiry on group activity, in seconds. Default disabled",
					"type": "number",
					"required": false,
					"value": 0 
				},

				{
					"name": "active",
					"description": "1 to enable, 0 to disable",
					"type": "number",
					"required": false,
					"value": 1,
					"valueList": [1, 0]
				},

			]
		},

		{	
			"op" : "groupset",
			"type": "group",
			"title" : "Edit a Group",
			"description": "Edit an existing group using GID obtained in the <code>group add</code> operation. <br><br> Group Flags: <br> <ul> <li>0 - normal group, only members can send</li><li>1 - only selected members can send (refer add members API)</li><li>0x20 - received by one member in the round-robin fashion</li><li>0x40 - do no store group messages</li><li>0x80 - loop back to sender</li></ul> <br> To know about setting the group permissions per message type, see <a href='https://mesibo.com/documentation/api/backend-api/#group-permissions-per-message-type' target='_blank'>here</a>",
			"requestUrl": "",
			"params": [ 
				{
					"name": "gid",
					"description": "Group ID (GID)",
					"type": "number",
					"required": true,					
				},
				{
					"name": "type",
					"description": "Group Permissions per message type",
					"type": "number",
					"required": false,
				},
				{
					"name": "name",
					"description": "Group Name",
					"type": "string",
					"required": false,
					"value": ""
				},
				{
					"name": "flag",
					"description": "Group Flags",
					"type": "string",
					"required": true,
					"value": "0",
					"valueList": ["0", "1", "0x20", "0x40", "0x80"]
				},
				{
					"name": "expiry",
					"description": "In minutes, default 1 year",
					"type": "number",
					"required": false,
					"value": 525600 
				},
				{
					"name": "expiryext",
					"description": "Auto extend expiry on group activity, in seconds. Default disabled",
					"type": "number",
					"required": false,
					"value": 0 
				},

				{
					"name": "active",
					"description": "1 to enable, 0 to disable",
					"type": "number",
					"required": false,
					"value": 1,
					"valueList": [1, 0]
				},

			]
		},

		{	
			"op" : "groupeditmembers",
			"type": "group",
			"title" : "Add or Remove Group Members",
			"description": "Add or Remove Group Members using GID obtained in the group <code>add</code> operation. <br> To know about setting the group permissions per message type, see <a href='https://mesibo.com/documentation/api/backend-api/#group-permissions-per-message-type' target='_blank'>here</a>",
			"requestUrl": "",
			"params": [ 
				{
					"name": "gid",
					"description": "Group ID (GID)",
					"type": "number",
					"required": true,					
				},
				{
					"name": "type",
					"description": "Group Permissions per message type",
					"type": "number",
					"required": false,					
				},
				{
					"name": "m",
					"description": "comma-separated list of user addresses to add or remove in the group",
					"type": "string",
					"required": true,
					"value": ""
				},
				{
					"name": "cs",
					"description": "1 if members being added can send messages to the group, 0 for not",
					"type": "number",
					"required": false,
					"valueList":[ 1, 0]
				},
				{
					"name": "cr",
					"description": "1 if members being added can receive group messages, 0 for not",
					"type": "number",
					"required": false,
					"valueList":[ 1, 0]
				},
				{
					"name": "canpub",
					"description": "[group calling] 1 if members being added can make (publish) group voice or video calls, 0 for not",
					"type": "number",
					"required": false,
					"valueList":[ 0, 1]
				},
				{
					"name": "cansub",
					"description": "[group calling] 1 if members being added can subscribe to group voice or video calls, 0 for not",
					"type": "number",
					"required": false,
					"valueList":[ 0, 1]
				},
				{
					"name": "canlist",
					"description": "[group calling] 1 if members being added can get a list of active callers in the group, 0 for not",
					"type": "number",
					"required": false,
					"valueList":[ 0, 1]
				},
				{
					"name": "delete",
					"description": "0 to add members, 1 to remove members",
					"type": "number",
					"required": true,
					"value": 0
				}		

			]
		},

		{	
			"op" : "groupdel",
			"type": "group",
			"title" : "Delete a Group",
			"description": "Delete an existing group using GID obtained in the group add operation.",
			"requestUrl": "",
			"params": [ 
				{
					"name": "gid",
					"description": "Group ID (GID)",
					"type": "number",
					"required": true,				 
				}
			]
		},

		{	
			"op" : "groupgetmembers",
			"type": "group",
			"title" : "Get Group Members",
			"description":"Get Group Members using GID obtained in the group add operation.This API is only for development purpose only and hence maximum 20 users will be returned. You should store your group members locally instead of obtaining from the mesibo.",
			"requestUrl": "",
			"params": [ 
				{
					"name": "gid",
					"description": " Group ID (GID)",
					"type": "number",
					"required": true,					
				},
				{
					"name": "count",
					"description": "Max number of users to get. Max 20",
					"type": "number",
					"required": true,
					"value": 20
				},
			]
		},

	];

	$scope.initApis = function(apiListJson){
		if(!(apiListJson && apiListJson.length))
			return;

		$scope.apis = [];
		for (var i = 0; i < apiListJson.length; i++) {
			var a = apiListJson[i];
			//TODO: Perform validation
			a.requestUrl = $scope.getRequestUrl(a);
			$scope.apis.push(a);
		}

		$timeout(function()  {
               document.getElementById("api-card-0").scrollIntoView();
        });
	}

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
			var value = params[i].value;

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


		var url = $scope.getRequestUrl(api);
		if(!url)
			return;

		// var eleUrl = document.getElementById("request-"+ api.op);
		// if(!eleUrl)
		// 	return;
		
		// eleUrl.value = url;
		$scope.requestUrl = url;
		$scope.$applyAsync();
	}

	$scope.getApi = function(a){
		if(!(a && a.op))
			return;

		for (var i = $scope.apis.length - 1; i >= 0; i--) {
			if($scope.apis[i].op == a.op)
				return $scope.apis[i];
		}
	}

	$scope.setApiDescription = function(api){
		if(!api)
			return;

		
		$timeout(function()  {
               // console.log("setApiDescription", document.getElementById("api-description-" + api.op));
               if(document.getElementById("api-description-" + api.op))
					document.getElementById("api-description-" + api.op).innerHTML = api.description;
        });
		
	}

	$scope.updateDescription = function(api, param, platform){
		if(!(api && param && platform))
			return RESULT_FAIL;		

		if(!param.name)
			return RESULT_FAIL;

		$scope.selected_platform[param.name] = platform;

		var e = document.getElementById("platform-menu-"+ param.name);
		if(!e)
			return RESULT_FAIL;
		e.textContent = platform;

		var alt = param.alt;
		if(!alt)
			return RESULT_FAIL;

		var newDescription = alt[platform].description;
		if(!newDescription)
			return RESULT_FAIL;

		var param_description = document.getElementById("param-description-"+ param.name);
		if(!param_description)
			return RESULT_FAIL;

		param_description.innerHTML = newDescription;
		// console.log("updateDescription", newDescription, param_description);
		
		if(document.getElementById("input-param-"+ api.op + "-" + param.name)){
			if(alt[platform].placeholder)
				document.getElementById("input-param-"+ api.op + "-" + param.name).placeholder = alt[platform].placeholder;
		}

		if(param.value){
			$scope.checkValidParam(api, param);
		}
			
	}
	
	$scope.setToken = function(){
		var t = document.getElementById("apptoken");
		if(!(t && t.value))
			return;

		$scope.token = t.value;
		toastr.success("Token saved. Click on the API description to try it!");
		document.getElementById("img-apptoken").style.display = "none";
		$scope.initApis($scope.apiJson);

	}


	$scope.validateParam = function(param, value){
		// console.log("validateParam", api, param);
		if(!(param && param.name)){
			return;
		}


		if("" === value || undefined === value){											
			return RESULT_FAIL;
		}			
		

		if(param.name === "appid"){

			var platform = $scope.selected_platform[param.name];
			var contains_dot = false;

			if(typeof value === "string"){
				for (var i = 0; i < value.length; i++) {
					if(!isNaN(value[i])){
						return RESULT_FAIL_APPID_NAN;
					}

					if(value[i] == ".")
						contains_dot = true;					
				}
			}

			if(platform && !contains_dot){		
				if(platform == "Android"){
					return RESULT_FAIL_APPID_DOTS;
				}

				if(platform == "iOS"){
					return RESULT_FAIL_APPID_DOTS;
				}
			}
		}

		return RESULT_OK;
	}

	$scope.checkValidParam = function(api, param){
		
		if(!(api && param))
			return;
		

		if(!param.name)
			return;
		

		var value = param.value;

		// console.log("checkValidParam", param, value);
		var result = $scope.validateParam(param, value);

		if(param.required){
			if(RESULT_OK == result)
				param.error = "";

			if(RESULT_FAIL == result)
				param.error = "Enter a valid input";		

			if(RESULT_FAIL_APPID_NAN == result)
				param.error = "Enter a non-numeric string value";
			
			if(RESULT_FAIL_APPID_DOTS == result)
				param.error = "Enter a valid Package Name/Bundle ID. Example, com.mesibo.firstapp";
		}		
		
		$scope.$applyAsync();
	}

	$scope.isRequiredParamsValid = function(api){
		if(!(api.params && api.params.length))
			return false;

		for (var i = 0; i < api.params.length; i++) {
			var p = api.params[i];				

			if(p.required){
				var val = $scope.validateParam(p, p.value);
				// console.log(p, val);
				if(RESULT_FAIL == val || RESULT_FAIL_APPID_NAN == val || RESULT_FAIL_APPID_DOTS == val){					
					return false;
				}
			}				
		}
		
		return true;
	}

	$scope.runRequest = function(api){		

		if(api.params && api.params.length){
			for (var i = 0; i < api.params.length; i++) {
				var p = api.params[i];

				var val = $scope.validateParam(api, p);

				if(RESULT_FAIL == val || RESULT_FAIL_APPID_NAN == val || RESULT_FAIL_APPID_DOTS == val){
					console.log("Invalid parameter ", p);
					return;
				}				
			}
		}

		var request_url = $scope.getRequestUrl(api);
		if(!request_url)
			return;

		fetch(request_url)
		  .then(response => response.json())
		  .then(data => {
			  	console.log(data);			  	
				try{
					api.response = JSON.stringify(data);
					$scope.$applyAsync();
				}
				catch (e){
					console.log(e);
				}
		  	});

		
		// window.open(request_url, '_blank');
	}

	$scope.copyText = function(ele_name){
		if(!ele_name)
			return;

		//https://www.w3schools.com/howto/howto_js_copy_clipboard.asp
		/* Get the text field */
		var copyText = document.getElementById(ele_name);
		if(!copyText)
			return;
		/* Select the text field */
		copyText.select();
		copyText.setSelectionRange(0, 99999); /* For mobile devices */

		/* Copy the text inside the text field */
		document.execCommand("copy");

		/* Alert the copied text */
		console.log("Copied: " + copyText.value);
	}

	// $scope.initApis($scope.apiJson);

}]);

//For debugging purposes only
function getScope(){
        return angular.element(document.getElementById('mesiboapiplay')).scope();
};


