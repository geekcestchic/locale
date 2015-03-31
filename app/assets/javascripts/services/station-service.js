app.factory('StationService',['$http','$resource', function($http,$resource){
  
  var StationService = {

    getClosestStation: function(map,latitude,longitude){
      
      var currentLocation = new google.maps.LatLng(latitude,longitude);
      var closestStations = [];
      var request = {
          location: currentLocation,
          rankBy: google.maps.places.RankBy.DISTANCE,
          types: ['subway_station','train_station']
        }; 
      service = new google.maps.places.PlacesService(map);
      service.nearbySearch(request, callback);
      function callback(results, status) {
        for (var i = 0; i < 3; i++) {
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
        StationService.showClosestStations(closestStations);
      };
    },

    showClosestStations: function(stations){

     var dataset = stations
     //Width and height
     var w = $(window).width();
     var h = $(window).height()/2;
     var padding = 30;
     var margin = {
      right:300
     }
     
     //Create scale functions
     var rScale = d3.scale.linear()
                .domain([
                  d3.min(dataset,function(d){ return d.distance; }), 
                  d3.max(dataset, function(d) { return d.distance; })
                  ])
                .range([30, (w - padding * 2)/8]);

     //Define X axis
     var xAxis = d3.svg.axis()
               .scale(rScale)
               .orient("bottom")
               .ticks(3);

     //Create SVG element
     var svg = d3.select("stations")
       .append("svg")
       .attr("width", w)
       .attr("height", h)
       .attr("class","station")
       .append("g")

     //Create circles
     svg.selectAll("circle")
         .data(dataset)
         .enter()
         .append("circle")
         .attr("r", function(d){
           return rScale(d.distance);
         })
         .attr("cx", w/2-margin.right)
         .attr("cy", h/2)
         .style("fill","none")
         .style("stroke","black")
         .style("stroke-width","1")
         .style("stroke-style","dotted")

      svg.selectAll('pointer')
        .data(dataset)
        .enter()
        .append('line')
        .attr('class','pointer')
        .attr('x1',function(d){
          return w/2-margin.right
        })
        .attr('y1', function(d){ return h/2 - rScale(d.distance) })
        .attr('x2', w-margin.right*2)
        .attr('y2',function(d,i){
          return h/2 - i*30 - 7
        })
        .style("stroke","black")
        .style("stroke-dasharray","5,10")

      svg.selectAll('station')
        .data(dataset)
        .enter()
        .append('text')
        .attr('class','station')
        .attr('x',function(d, i){
          return w-margin.right*2
        })
        .attr('y',function(d, i){
          return h/2 - i*30
        })
        .text(function(d){
          return d.name + ' | ' + d.distance + 'm | ' + Math.round(d.distance/100) + 'min walk'
        })
        .attr('font-size',20)

     svg.append('circle')
        .attr('r',10)
        .attr('class','yourlocation')
        .attr("cx", w/2-margin.right)
        .attr("cy", h/2)
        .style("fill","red")

     //Create X axis
     svg.append("g")
       .attr("class", "axis")
       .attr("transform", "translate("+(w/2-margin.right)+","+h/2+")")
       .call(xAxis)
       .attr("font-size", "15px")
       .style('stroke-width',1)
    }

  };

  return StationService;

}]);