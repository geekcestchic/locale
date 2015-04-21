app.controller('LocationController', ['$scope','$rootScope','$timeout','$http','$q','LocationService','CrimeService','PropertyService','StationService' ,function($scope, $rootScope, $timeout, $http, $q, LocationService, CrimeService, PropertyService,StationService){
  
  //The function that is called upon form submission
  $scope.returnStats =  function(address){
    //first bring the window down to the bottom
    $scope.scrollTop(4);
    // CRIMES//
    //geocoding the address to use the crimes api
    LocationService.codeAddress(address)  // Geocoding the address, see Location Service
    .then(function(data) {
      $scope.coordinates = data;
      LocationService.reverseGeocode(data)
      .then(function(data){
        $scope.location=data; //we assign this variable that we will use in our html
      });
      return CrimeService.getCrimes(data.latitude, data.longitude)  // Getting Data from Crimes API
    })
    .then(function(crimesObject) {
      $scope.crimes = crimesObject.data;
      CrimeService.countCrimes($scope.coordinates, $scope.crimes);
    });

    //PROPERTY PRICES// 
    //Calling the Zoopla API
    PropertyService.getPropertyPrices(address)
    
    //MAPS & PLACES//
    //geocoding the address to use the google places API to find the closest station
    LocationService.codeAddress(address)
    .then(function(data){
      $scope.coordinatesForStation = data;
      $scope.$on('mapInitialized', function(event, map){
        $scope.map = map

        //CLOSEST STATION
        //getting the closest station from Google places
        StationService.getClosestStation($scope.map, data.latitude, data.longitude)
        // getting the closest competitors
        LocationService.getCompetitors('cafe',$scope.map, data.latitude, data.longitude)
        .then(function(data){
          $scope.competitors = data;
        })
      });    
    })
    $scope.newLocation = '';
    $scope.locationForm.$setPristine();
  };

  //snazzy maps
  $scope.mapStyle = mapStyle;
  
  //Scrolling to n times the height below the top of the page!
  $scope.scrollTop = function(n){
    var windowHeight = $(window).height()
    $("html, body").animate({ scrollTop: n * windowHeight });
  }

}]);

mapStyle = [{
  "featureType":"landscape.natural",
  "elementType":"geometry.fill",
  "stylers":[{"visibility":"on"},{"color":"#e0efef"}]
  },
  {"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},
  {"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},
  {"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},
  {"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},
  {"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]
}]