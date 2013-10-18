var app = angular.module("app", []);


function localConstructor() {
    this.write = function (key, obj) {
        localStorage.setItem(key, JSON.stringify(obj));
        return this;
    };
    this.get = function (key) {
        var obj = JSON.parse(localStorage.getItem(key));
        return obj;
    };
    this.clear = function () {
        localStorage.clear();
        return this;
    };
    this.remove = function (key) {
        localStorage.removeItem(key);
        return this;
    };
};

var local = new localConstructor();
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider.when('/', {
    templateUrl: '/src/app/views/login.ng',
    controller: 'HomeController'
  });
 
  $routeProvider.when('/login', {
    templateUrl: '/src/app/views/login.ng',
    controller: 'LoginController'
  }); 

  $routeProvider.when('/:event', {
    templateUrl: '/src/app/views/event.ng',
    controller: 'EventController'
  });  
 
  $routeProvider.otherwise({ redirectTo: '/' });
}]);
app.controller("EventController", ['$scope', '$location', '$http', 'apiCall', function($scope, $location, $http, apiCall) {
	var chart_element = document.getElementById("myChart").getContext("2d"),
		$chart = $('#myChart'),
		$event_info = $('#event_info'),
  		event_name = $location.path().replace('/', ''); 
  	$scope.event_url = event_name;
	scope = $scope;
	genderChart = new Chart(chart_element);


	options = {
		segmentShowStroke : true,
		segmentStrokeColor : "#fff",
		segmentStrokeWidth : 5,
		animation : true,
		animationSteps : 100,
		// animationEasing : "easeOutQuart",
		animateRotate : true,
		animateScale : true,
		onAnimationComplete : null
	};
	$scope.getEvent = function () {
	  	apiCall.getEvent(event_name).then(function(result) {
	  		angular.extend($scope, result.data[0]);
	  		if (local.get('user')){
	  			var user_id = local.get('user').user_id;
	  			if ($scope.voted_users.indexOf(user_id) > -1) {
	  				$scope.voted = true;
	  			} else {
	  				console.log(false)
	  			}
	  		}
	  		$chart.css({"max-height": (window.innerHeight - 40)+"px", "max-width": (window.innerHeight - 40)+"px"});
	  		if ($scope.boy_votes_length === 0 && $scope.girl_votes_length === 0) {
	  			$scope.chart_data = [
		  			{
		  				value: 1,
		  				color: "rgb(156, 206, 255)"
		  			},
		  			{
		  				value: 1,
		  				color: "rgb(255, 190, 190)"
		  			},
		  		];
	  		} else {
		  		$scope.chart_data = [
		  			{
		  				value: $scope.boy_votes_length,
		  				color: "rgb(156, 206, 255)"
		  			},
		  			{
		  				value: $scope.girl_votes_length,
		  				color: "rgb(255, 190, 190)"
		  			},
		  		];
	  		}
	  		if ($scope.chart_type === 'Doughnut') {
		  		genderChart.Doughnut($scope.chart_data, options);
	  		} else if ($scope.chart_type === "Pie") {
	  			genderChart.Pie($scope.chart_data, options);
	  		}
	  		setTimeout(function() {
	  			if (window.innerWidth > 767) {
			  		$event_info.animate({"top": ((window.innerHeight - 40)- $event_info.outerHeight())/2 + 'px'});
			  	}
	  		},20)
		});
	}
	$scope.getEvent();
	$scope.vote = function (e, gender) {
		var $this = $(e.target);
		$scope.voted = true;
		console.log(gender);
		var user_id = FB.getUserID()
		console.log(user_id);
		if (user_id.length === 0) {
			FB.login(function (response) {
				if (response.status === 'connected') {
					var obj = {};
					obj.access_token = response.authResponse.accessToken;
					obj.user_id = response.authResponse.userID;
					FB.api('/me', function(user) {
						obj.first_name = user.first_name;
						obj.last_name = user.last_name;
						obj.user_id = user.id;
						obj.email = user.email;
						obj.gender = user.gender;
						obj.birthday = user.birthday;
						if (typeof user.location !== undefined) {
							obj.location = user.location.name;
						}
						local.write('user', obj);
						$scope.$apply(function() {
							apiCall.createUser(obj)
								.success(function (s) {
									var vote_obj = {};
									vote_obj.event_id = $scope._id;
									vote_obj.first_name = local.get('user').first_name;
									vote_obj.user_id = local.get('user').user_id;
									apiCall.vote(vote_obj, gender)
										.then(function () {
											$scope.getEvent();
											FB.ui({
											  method: 'feed',
											  picture: 'http://www.losangelesweddingphotography.org/wp-content/uploads/2013/10/itsa' + gender + '.jpg',
											  link: 'http://guessthesex.co/' + $scope.name,
											  Title: 'Guess the sex of the ' + $scope.mothers_last_name + ' baby.',
											  caption: 'I guessed it will be a ' + gender + '! Guess with me, or create your own gender guessing event.',
											}, function(response){
												console.log('posted link');
											});
										});
								})
								.error(function (e) {
									console.log('error', e);
								});
						});
					});
				} else {
					$scope.voted = false;
					$scope.$apply();
				}
			}, {scope:'email, user_likes, user_checkins, user_birthday'});
		} else {
			var vote_obj = {};
			vote_obj.event_id = $scope._id;
			vote_obj.first_name = local.get('user').first_name;
			vote_obj.user_id = local.get('user').user_id;
			apiCall.vote(vote_obj, gender)
				.then(function () {
					$scope.getEvent();
					FB.ui({
					  method: 'feed',
					  picture: 'http://www.losangelesweddingphotography.org/wp-content/uploads/2013/10/itsa' + gender + '.jpg',
					  link: 'http://guessthesex.co/' + $scope.name,
					  Title: 'Guess the sex of the ' + $scope.mothers_last_name + ' baby.',
					  caption: 'I guessed it will be a ' + gender + '! Guess with me, or create your own gender guessing event.',
					}, function(response){
						console.log('posted link');
					});
				});
		}
	};
	$(window).resize(function () {
		if (window.innerWidth >767) {
			$event_info.css({"margin-top": ((window.innerHeight - 40)- $event_info.outerHeight())/2 + 'px'});
		} else {
			$event_info.css({"margin-top": '0'});
		}
		$chart.css({"max-height": (window.innerHeight - 40)+"px", "max-width": (window.innerHeight - 40)+"px"});
	})
}]);    
app.controller("HomeController", ['$scope', 'AuthenticationService', function($scope, AuthenticationService) {
  $scope.title = "Awesome Home";
  $scope.message = "Mouse Over these images to see a directive at work!";

  $scope.logout = function() {
    AuthenticationService.logout();
  };
}]); 
app.controller("LoginController", ['$scope', '$location', 'AuthenticationService', function($scope, $location, AuthenticationService) {
  $scope.credentials = { username: "", password: "" };

  $scope.login = function() {
    AuthenticationService.login($scope.credentials);
  }
}]);
app.factory('apiCall', ['$http', function($http) {
   return {
        getEvent: function (event_name) {
            return $http.get('/api/events/get_event/' + event_name)
        },
        vote: function (event_info, gender) {
        	if (gender === 'boy') {
        		return $http.get('/api/events/vote_boy/' + event_info.event_id + '/' + event_info.first_name +'/' + event_info.user_id);
        	} else if (gender ===  'girl') {
        		return $http.get('/api/events/vote_girl/' + event_info.event_id + '/' + event_info.first_name +'/' + event_info.user_id);
        	}
        },
        createUser: function(obj) {
        	return $http.post('/api/users/create/', obj);
        },
        getUser : function (user_id) {
        	return $http.get('/api/users/get_user/' + user_id)
        }
   }
}]);
app.factory("AuthenticationService", ['$location', function($location) {
  return {
    login: function(credentials) {
      if (credentials.username !== "ralph" || credentials.password !== "wiggum") {
        alert("Username must be 'ralph', password must be 'wiggum'");
      } else {
        $location.path('/');
      }
    },
    logout: function() {
      $location.path('/login');
    }
  };
}]);
