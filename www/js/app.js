var app = angular.module("app", [])

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

app.factory('apiCall', ['$http', function($http) {
   return {
        getEvent: function(event_name) {
             //return the promise directly.
            return $http.get('/api/events/get_event/' + event_name)
                 
        }
   }
}]);
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $routeProvider.when('/', {
    templateUrl: '/src/app/views/home.ng',
    controller: 'HomeController'
  });
 
  $routeProvider.when('/login', {
    templateUrl: '/src/app/views/login.ng',
    controller: 'LoginController'
  }); 

  $routeProvider.when('/:child', {
    templateUrl: '/src/app/views/home.ng',
    controller: 'EventController'
  });  
 
  $routeProvider.otherwise({ redirectTo: '/' });
}]);
app.controller("EventController", ['$scope', '$location', 'apiCall', function($scope, $location, apiCall) {
	$scope.girl_votes_length = 0;
	$scope.boy_votes_length = 0;
  	var event_name = $location.path().replace('/', ''); 
  	apiCall.getEvent(event_name).then(function(result) {
  		angular.extend($scope, result.data[0]);
  		var w = 300,                        //width
	    h = 300,                            //height
	    r = 100,                            //radius
	    color = d3.scale.category20c();     //builtin range of colors
	 
	    data = [{"label":"Girl Votes", "value":$scope.girl_votes_length}, 
	            {"label":"Boy Votes", "value":$scope.boy_votes_length}];
	    
	    var vis = d3.select("#graph")
	        .append("svg:svg")              //create the SVG element inside the <body>
	        .data([data])                   //associate our data with the document
	            .attr("width", w)           //set the width and height of our visualization (these will be attributes of the <svg> tag
	            .attr("height", h)
	        .append("svg:g")                //make a group to hold our pie chart
	            .attr("transform", "translate(" + r + "," + r + ")")    //move the center of the pie chart from 0, 0 to radius, radius
	 
	    var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
	        .outerRadius(r);
	 
	    var pie = d3.layout.pie()           //this will create arc data for us given a list of values
	        .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array
	 
	    var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
	        .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
	        .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
	            .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
	                .attr("class", "slice");    //allow us to style things in the slices (like text)
	 
	        arcs.append("svg:path")
	                .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
	                .attr("d", arc);                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
	 
	        arcs.append("svg:text")                                     //add a label to each slice
	                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
	                //we have to make sure to set these before calling arc.centroid
	                d.innerRadius = 0;
	                d.outerRadius = r;
	                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
	            })
	            .attr("text-anchor", "middle")                          //center the text on it's origin
	            .text(function(d, i) { return data[i].label; });        //get the label from our original data array
	});
	
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