app.controller('LocationController', function($scope, $rootScope, $timeout, $http, $q, LocationService, NearbyService){

  $scope.returnStats =  function(address){
    //geocoding the address to use the crimes api
    LocationService.codeAddress(address)  // Geocoding the address, see Location Service
    .then(function(data) {
      $scope.coordinates = data;
      return LocationService.getCrimes(data.latitude, data.longitude)  // Getting Data from Crimes API
    })
    .then(function(crimesObject) {
      $scope.crimes = crimesObject.data;
      LocationService.countCrimes($scope.coordinates, $scope.crimes);
    });
    //Zoopla API
    NearbyService.getPropertyPrices(address)
    //geocoding the address to use the google places API to find the closest station
    LocationService.codeAddress(address)
    .then(function(data){
      $scope.coordinatesForStation = data;
      $scope.$on('mapInitialized', function(event, map){
        $scope.map = map
        NearbyService.getClosestStation($scope.map, data.latitude, data.longitude)
      });    
    })
  };
  //snazzy maps
  $scope.mapStyle = mapStyle;

});

mapStyle = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}]

