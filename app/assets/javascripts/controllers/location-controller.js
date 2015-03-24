app.controller('LocationController', function($scope, $timeout, $http, $q, LocationService) {

  // $scope.$on('mapInitialized', function(event, map) {
  //       // map.setCenter(51,0)
  //       console.log('map initialized')
  //     });

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

  $scope.mapStyle = mapStyle;

});

mapStyle = [{"featureType":"landscape.natural","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#e0efef"}]},{"featureType":"poi","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"hue":"#1900ff"},{"color":"#c0e8e8"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":100},{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":700}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#7dcdcd"}]}]

