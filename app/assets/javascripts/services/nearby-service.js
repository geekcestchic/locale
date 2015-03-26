app.factory('NearbyService', function($http,$resource){
  
  var NearbyService = {

    getPropertyPrices: function(address){
      var formattedAddress = address.replace(',','').split(' ').join('+');
      $http.post('static/get_property_prices', {data:{area:formattedAddress}})
      .success(function(data, status) {
        NearbyService.analysePropertyPrices(data)
      })
      .error(function(data, status) {
        console.log(data) || "Request failed";
      });
    },

    analysePropertyPrices: function(data){
      console.log('property prices',data);
      if (data.listing.length===0){
        alert('No properties in this area')
      }
      else if(data.disambiguation.length > 1){
        alert('Please be more specific, here are some suggested options:'+data.disambiguation)
      }
      else{
        var analysis ={
          numberOfProperties: data.listing.length,
          averagePrices: 2000000
        };
      }
      
    },

    getClosestStation: function(map,latitude,longitude){
      
      var currentLocation = new google.maps.LatLng(latitude,longitude);
      var closestStations = [];
      var request = {
          location: currentLocation,
          rankBy: google.maps.places.RankBy.DISTANCE,
          types: ['subway_station']
        }; 
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);
      function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          var stationObject = results[0];
          var formattedCurrentLocation = {
            latitude: latitude,
            longitude: longitude
          };
          var station = { //formatting our own object, so we can then pass it to calculate the distance
            name: stationObject.name,
            latitude: stationObject.geometry.location.k,
            longitude: stationObject.geometry.location.D  
          };
          station.distance = getDistance(formattedCurrentLocation, station);
        };
        NearbyService.showClosestStation(station);
      };
    },

    showClosestStation: function(station){
      $('stations').append('<h1>Closest Tube Station</h1>')
      $('stations').append('<p>'+station.name+'</p>')
      $('stations').append('<p>'+station.distance+'m away</p>')
    }

  };

  return NearbyService;

});