app.factory('PropertyService',['$http', function($http){
  
  var PropertyService = {

    getPropertyPrices: function(address){
      var formattedAddress = address.replace(',','').split(' ').join('+');
      $http.post('static/get_property_prices', {data:{area:formattedAddress}})
      .success(function(data, status) {
        //let us format the data first
        PropertyService.graphPropertyPrices(data)
      })
      .error(function(data, status) {
        console.log(data) || "Request failed";
      });
    },

    graphPropertyPrices: function(data){
      
      var dataset = data.areas
      dataset = dataset.filter(function(area){
        return area.average_sold_price_1year !== "0"
      })

      console.log(data)      

      var margin = {top: 10, right: 300, bottom: 30, left: 60},
      width = $(window).width() - margin.left - margin.right,
      height = $(window).height()/2 - margin.top - margin.bottom;
      var barPadding = 10;
      
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
                  }),0])
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
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr('class','property')
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
          if (increase >0){return '+'+increase+'%'}
          else {return increase+'%'}
         })
         // .attr('class', function(increase){
         //  if (increase < 0){return 'negative'}
         // })
         .attr("x", function(d, i) {
            return i * (width / dataset.length) + (width / dataset.length - barPadding) / 2;
         })
         .attr("y",function(d){
          return yScale(d.average_sold_price_1year)-5;
         })

      svg.append("g")
        .attr("class","axis")
        .call(yAxis)
        .attr("font-size", "11px")
        .attr("transform", "translate(" + -5 + ", 0)")
    }

  };

  return PropertyService

}]);