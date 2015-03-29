app.factory('NearbyService', function($http,$resource){
  
  var NearbyService = {

    getPropertyPrices: function(address){
      var formattedAddress = address.replace(',','').split(' ').join('+');
      $http.post('static/get_property_prices', {data:{area:formattedAddress}})
      .success(function(data, status) {
        //let us format the data first
        NearbyService.analysePropertyPrices(data.listing)
      })
      .error(function(data, status) {
        console.log(data) || "Request failed";
      });
    },

    analysePropertyPrices: function(data){
      console.log('property prices',data);
      if (data.length===0){
        alert('No properties in this area')
      }
      // else if(data.disambiguation.length > 1){
      //   alert('Please be more specific, here are some suggested options:'+data.disambiguation)
      // }
      else{
        var analysis ={
          numberOfProperties: data.length,
          rentDistribution: {firstRange:0,secondRange:0,thirdRange:0, fourthRange:0},
          saleDistribution: {firstRange:0,secondRange:0,thirdRange:0, fourthRange:0},
          averagerent: 0,
          averagePurchasePrice: 0
        };
        _.each(data, function(listing){
          if (listing.listing_status === 'rent' && listing.num_bedrooms !== 0 && listing.num_bedrooms < 5){
            var rentPerRoom = listing.rental_prices.per_week / listing.num_bedrooms;
            if (rentPerRoom < 100){analysis.rentDistribution.firstRange += 1}
            if (rentPerRoom > 100 && rentPerRoom <=200){analysis.rentDistribution.secondRange += 1}
            if (rentPerRoom > 200 && rentPerRoom <=300){analysis.rentDistribution.thirdRange += 1}
            if (rentPerRoom > 300){analysis.rentDistribution.fourthRange += 1}
          }
          else if(listing.listing_status === 'sale' && listing.num_bedrooms !== 0 && listing.num_bedrooms < 5){
            var pricePerRoom = listing.price / listing.num_bedrooms
          }
        });
        console.log('analysis',analysis)
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
        for (var i = 0; i < 5; i++) {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            var stationObject = results[i];
            var formattedCurrentLocation = {
              latitude: latitude,
              longitude: longitude
            };
            closestStations[i] = { //formatting our own object, so we can then pass it to calculate the distance
              name: stationObject.name,
              latitude: stationObject.geometry.location.k,
              longitude: stationObject.geometry.location.D  
            };
            closestStations[i].distance = getDistance(formattedCurrentLocation, closestStations[i]);
          };
        };
        NearbyService.showClosestStations(closestStations);
      };
    },

    showClosestStations: function(stations){

      var dataset = stations

     //Width and height
     var w = 800;
     var h = 300;
     var padding = 30;
     
     //Create scale functions
     var xScale = d3.scale.linear()
                .domain([0, d3.max(dataset, function(d) { return d.distance; })])
                .range([padding, w - padding * 2]);

     //Define X axis
     var xAxis = d3.svg.axis()
               .scale(xScale)
               .orient("bottom")
               .ticks(5);

     //Create SVG element
     var svg = d3.select("stations")
       .append("svg")
       .attr("width", w)
       .attr("height", h);

     //Create lines
     svg.selectAll("line")
         .data(dataset)
         .enter()
         .append("line")
         .attr("x1", function(d){
           return xScale(d.distance);
         })
         .attr("x2", function(d){
           return xScale(d.distance);
         })
         .attr("y1", h-padding)
         .attr("y2", padding+50)
         .attr("stroke", "black")
         .attr("stroke-width", "1")
         .attr("stroke-linecap", "round")


     //Create Labels
     svg.selectAll("text")
         .data(dataset)
         .enter()
         .append("text")
         .text(function(d){
           return d.name
         })
         .attr("x",function(d){
           return xScale(d.distance)-30
         })
         .attr("y",padding+50)

     //Create X axis
     svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate(0," + (h - padding) + ")")
       .call(xAxis);
    }

  };

  return NearbyService;

});