app.controller('LocationController', ['$scope','$rootScope','$timeout','$http','$q','LocationService','CrimeService','PropertyService','StationService' ,function($scope, $rootScope, $timeout, $http, $q, LocationService, CrimeService, PropertyService,StationService){

  $scope.returnStats =  function(address){
    
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
    //Zoopla API
    PropertyService.getPropertyPrices(address)
    //geocoding the address to use the google places API to find the closest station
    LocationService.codeAddress(address)
    .then(function(data){
      $scope.coordinatesForStation = data;
      $scope.$on('mapInitialized', function(event, map){
        $scope.map = map
        //getting the closest station from Google places
        StationService.getClosestStation($scope.map, data.latitude, data.longitude)
        
        // getting the closest competitors // fix this later
        // LocationService.getCompetitors('cafe',$scope.map, data.latitude, data.longitude)
        // .success(function(data){
        //   $scope.competitors = data;
        //   console.log($scope.competitors)
        // })
        // .fail(function(status){
        //   console.log(status)
        // })

      });    
    })


  };
  //snazzy maps
  $scope.mapStyle = mapStyle;

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