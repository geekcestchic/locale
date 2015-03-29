app.factory('NearbyService', function($http,$resource){
  
  var NearbyService = {

    getPropertyPrices: function(address){
      var formattedAddress = address.replace(',','').split(' ').join('+');
      $http.post('static/get_property_prices', {data:{area:formattedAddress}})
      .success(function(data, status) {
        //let us format the data first
        NearbyService.graphPropertyPrices(data)
      })
      .error(function(data, status) {
        console.log(data) || "Request failed";
      });
    },

    graphPropertyPrices: function(data){
      var dataset = data;
      console.log(dataset)
      //Width and height
      var w = 800;
      var h = 300;
      var padding = 30;
      
      //defining the scale
      var xScale = d3.scale.linear()
                 .domain([0, data.length-1])
                 .range([padding, w - padding * 2]);

      var yScale = d3.scale.linear()
                 .domain([function(d){min(d)},function(d){(max(d))}])
      //x Axis
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom");

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10);
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