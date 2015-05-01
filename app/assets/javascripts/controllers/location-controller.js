app.controller('LocationController', ['$scope','$rootScope','$timeout','$http','$q','LocationService','CrimeService','PropertyService','StationService' ,function($scope, $rootScope, $timeout, $http, $q, LocationService, CrimeService, PropertyService,StationService){
  
  //The function that is called upon form submission
  $scope.returnStats =  function(address){
    //first bring the window down to the bottom
    $scope.scrollTop(4);
    //GET CRIMES//
    $scope.getCrimes(address);
    //GET PROPERTY PRICES// 
    PropertyService.getPropertyPrices(address) 
    .fulfilled(function(data, status) {
      //let us format the data first
      var dataset = data.areas
      dataset = dataset.filter(function(area){
        return area.average_sold_price_1year !== "0"
      })
      PropertyService.appendPropertyData(dataset)
      PropertyService.graphPropertyPrices(dataset) 
    })
    .rejected(function(data, status) {
      console.log(data) || "Request failed";
    });
    //GET GOOGLE PLACES//
    $scope.googlePlaces(address)
    //finally reinitialize the form
    $scope.newLocation = '';
    $scope.locationForm.$setPristine();
  };

  //Crimes function, will refer to crimes service
  $scope.getCrimes = function(address){
    LocationService.codeAddress(address)
    .then(function(data) {
      $scope.coordinates = data;
      $scope.reverseGeocode(data);
      return CrimeService.getCrimes(data.latitude, data.longitude)  // Getting Data from Crimes API
    })
    .then(function(crimesObject) {
      $scope.crimes = crimesObject.data;
      CrimeService.countCrimes($scope.coordinates, $scope.crimes); //count the crimes to then graph them
    });
  }
  
  //Get closest station and competitors
  $scope.googlePlaces = function(address){
    LocationService.codeAddress(address)
    .then(function(data){
      $scope.$on('mapInitialized', function(event, map){
        $scope.map = map
        //getting the closest station from Google places
        StationService.getClosestStation($scope.map, data.latitude, data.longitude)
        // getting the closest competitors
        LocationService.getCompetitors('cafe',$scope.map, data.latitude, data.longitude)
        .then(function(data){
          $scope.competitors = data;
        })
      });    
    })
  };

  //reverse geocoding to obtain formatted address
  $scope.reverseGeocode = function(coordinates){
    LocationService.reverseGeocode(coordinates)
    .then(function(data){
      $scope.location=data; //we assign this variable that we will use in our html
    });
  };

  //Scrolling to n times the height below the top of the page!
  $scope.scrollTop = function(n){
    var windowHeight = $(window).height()
    $("html, body").animate({ scrollTop: n * windowHeight });
  };
  
  //function that will clear the results to reinitialize
  $scope.clearResults = function(){
    $scope.coordinates = false;
  };

  //snazzy maps
  $scope.mapStyle = mapStyle;

}]);
//end of controller


//snazzy maps styling variable
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