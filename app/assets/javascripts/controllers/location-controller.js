app.controller('LocationController', function($scope, $timeout, $http, $q, LocationService) {
  $scope.map;
  // $scope.variable = [1,2,3];
  // console.log('underscore method'+$scope.variable.isArray)
  $scope.$on('mapInitialized', function(event, map) {
        // map.setCenter(51,0)
        console.log('map initialized')
      });

  $scope.returnStats =  function(address){
    LocationService.codeAddress(address)  // Geocoding the address, see Location Service
    .then(function(data) {
      $scope.coordinates = data;
      return LocationService.getCrimes(data.latitude, data.longitude)  // Getting Data from Crimes API
    })
    .then(function(crimesObject) {
      $scope.crimes = crimesObject.data;
      LocationService.countCrimes($scope.coordinates, $scope.crimes);
    });
  };

});