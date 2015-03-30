app.factory('NearbyService',['$http','$resource', function($http,$resource){
  
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
      var dataset = data.areas
      // var dataset = _.reject(dataset,function(area){
      //   return area.average_sold_price_1year === 0;
      // })      
      console.log(dataset)

      var margin = {top: 10, right: 50, bottom: 30, left: 50},
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;
      var barPadding = 10;
      
      console.log(dataset[0].average_sold_price_1year-dataset[0].average_sold_price_7year)

      function urlToStreetName(url){
        urlArray = url.split('/')
        return urlArray[urlArray.length-1].replace('-',' ')
      }

      var xScale = d3.scale.linear()
                 .domain([0, d3.max(dataset, function(d) { return d.length; })])
                 .range([0, width]);

      var yScale = d3.scale.linear()
                 .domain([
                  d3.max(dataset, function(d) { 
                    return d.average_sold_price_1year; 
                  }),
                  d3.min(dataset,function(d){
                    return d.average_sold_price_7year
                  })
                  ])
                 .range([margin.bottom, height-margin.top]);

      //Define X axis
      var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient("bottom")
                .ticks(5);

      var yAxis = d3.svg.axis()
                .scale(yScale)
                .orient("left")
                .ticks(5);

      //Create SVG element
      var svg = d3.select("property-prices").append("svg")
          // .style("background","lightgrey") //so we can see the limits
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
      
      svg.selectAll("oneyear") //these are the top bars
         .data(dataset)
         .enter()
         .append("rect")
         .attr('class','oneyear')
         .attr("x", function(d, i) {
            return i * (width / dataset.length);
         })
         .attr("y", function(d) {
            return yScale(d.average_sold_price_1year);
         })
         .attr("width", width / dataset.length - barPadding)
         .attr("height", 2)

      svg.selectAll("sevenyears") //these are the bottom bars
         .data(dataset)
         .enter()
         .append("rect")
         .attr('class','sevenyears')
         .attr("x", function(d, i) {
            return i * (width / dataset.length);
         })
         .attr("y", function(d) {
            return yScale(d.average_sold_price_7year);
         })
         .attr("width", width / dataset.length - barPadding)
         .attr("height", 2)

      svg.selectAll('line')
         .data(dataset)
         .enter()
         .append('line')
         .attr('x1',function(d,i){
          return i * (width / dataset.length) + (width / dataset.length - barPadding) / 2;
         })
         .attr('x2',function(d,i){
          return i * (width / dataset.length) + (width / dataset.length - barPadding) / 2;
         })
         .attr('y1',function(d){
          return yScale(d.average_sold_price_7year)
         })
         .attr('y2',function(d){
          return yScale(d.average_sold_price_1year)
         })
         .attr('stroke-width', 1)
         .attr('stroke-dasharray','5,5')
         .attr('stroke', 'black')


      svg.selectAll("label")
         .data(dataset)
         .enter()
         .append("text")
         .attr('class','label')
         .text(function(d) {
            return urlToStreetName(d.prices_url);
         })
         .attr("text-anchor", "middle")
         .attr("x", function(d, i) {
            return i * (width / dataset.length) + (width / dataset.length - barPadding) / 2;
         })
         .attr("y", height+margin.top)
         .attr("font-family", "sans-serif")
         .attr("font-size", "11px")

      svg.selectAll('increase')
         .data(dataset)
         .enter()
         .append('text')
         .attr('class','increase')
         .text(function(d){
          var increase = (d.average_sold_price_1year-d.average_sold_price_7year)/d.average_sold_price_7year
          increase = increase * 100
          increase = Math.round(increase)
          return '+'+increase+'%'
         })
         .attr("x", function(d, i) {
            return i * (width / dataset.length) + (width / dataset.length - barPadding) / 2;
         })
         .attr("y",function(d){
          return yScale(d.average_sold_price_1year)-5;
         })

      //Create X axis
      // svg.append("g")
      //   .attr("class", "axis")
      //   .attr("transform", "translate(0," + height + ")")
      //   .call(xAxis)
        // .append("text")
        //       // .attr("transform", "rotate(-90)")
        //       .attr("x", width/2+margin.left)
        //       // .attr("dy", ".71em")
        //       .style("text-anchor", "end")
        //       .text("Street Names");
        // .call(yAxis);

      svg.append("g")
        .attr("class","axis")
        .call(yAxis)
        .attr("font-size", "11px")
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

}]);