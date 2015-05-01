app.controller('TabController', ['$scope', function($scope){
  
  //initial state
  $scope.tab = 1;
  $scope.description = "closest competitors in the area";
  // $scope.setDescription(1); //this isn't working, strange..

  //boolean which checks which is the current tab
  $scope.isSet = function(checkTab){
    return $scope.tab === checkTab;
  };
  
  //function that sets the current tab
  $scope.setTab = function(setTab){
    $scope.tab = setTab;
    $scope.setDescription(setTab);
  }; 
  
  //sets the description in the header
  $scope.setDescription = function(tab){
    if (tab === 1) $scope.description = "closest competitors in the area";
    else if (tab === 2) $scope.description = "within a 200m radius of your location";
    else if (tab === 3) $scope.description = "tube and rail stations ranked by distance";
    else if (tab === 4) $scope.description = "average prices in streets in the area now compared to 7 years ago";
  };

}]);