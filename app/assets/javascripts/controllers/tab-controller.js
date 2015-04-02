app.controller('TabController', ['$scope', function($scope){
  $scope.tab = 1;
  this.isSet = function(checkTab){
    return $scope.tab === checkTab;
  };
  this.setTab = function(setTab){
    $scope.tab = setTab;
  };
}]);