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
	$scope.token = null;
	$scope.app_name = null;
	$scope.app_aid = 0;

	$scope.selected_platform = {};

	$scope.apis = [];

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
               // document.getElementById("api-card-0").scrollIntoView();
        });
	}

	$scope.getReqColor = function(p){
		if(!p)
			return;

		if(p.required)
			return 'red';

		return 'blue';
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

	$scope.updateDescription = function(api, param){
		if(!(api && param))
			return RESULT_FAIL;		

		var platform = param.platform;
		if(!platform)
			return;

		if(!param.name)
			return RESULT_FAIL;


		var alt = param.alt;
		if(!(alt && alt[platform]))
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

		var token = t.value;

		var request_url = $scope.root + "?token="+ token + "&d=1&op=appstats"
		fetch(request_url)
		  .then(response => response.json())
		  .then(data => {
			  	console.log(data);			  	
				try{
					if(data.result){
						$scope.token = token;
						$.getJSON("api_list.json", function(json) {							
						    $scope.initApis(json["list"]);
							if(data["app"]){
								$scope.app_name = data["app"]["name"];
								$scope.app_aid = data["app"]["aid"];
							}	
						});												
					}
					else{

						$scope.token = null;
						$scope.token_error = true;
					}

					$scope.$applyAsync();

				}
				catch (e){
					console.log(e);
				}				
		  	});

		

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

			var platform = param.platform;
			if(!isNaN(value)){
				return RESULT_FAIL_APPID_NAN;
			}

			var contains_dot = false;
			if(value[2] && "." == value[2])
				contains_dot = true;
		
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

		
		var result = $scope.validateParam(param, value);
		// console.log("checkValidParam", param, value, result);

		if(param.required){
			if(RESULT_OK == result)
				param.error = "";

			if(RESULT_FAIL == result)
				param.error = "Enter a valid value";		

			if(RESULT_FAIL_APPID_NAN == result)
				param.error = "Enter a non-numeric string value";
			
			if(RESULT_FAIL_APPID_DOTS == result){
				if(param.platform == "Android")
					param.error = "Enter a valid Package Name. Example, com.mesibo.androidapp";
				else
					param.error = "Enter a valid Bundle id. Example, com.mesibo.iosapp";
			}
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
	if(document.getElementById("apptoken"))
		document.getElementById("apptoken").focus();

}]);

//For debugging purposes only
function getScope(){
        return angular.element(document.getElementById('mesiboapiplay')).scope();
};


