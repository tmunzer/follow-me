

angular.module('Follow').controller("FollowCtrl", function ($scope, initService) {
    $scope.requestInit = undefined;
    $scope.clients = [];
    $scope.query = {
        limit: 10,
        page: 1,
        order: 'clientMac',
        filterOptions: {
            debounce: 500
        },
        filter: ''
    }

    $scope.countSessions = function (client) {
        return client.sessions.length;
    }

    $scope.connectionType = function (client) {
        if (client.wireless && client.wired) return "Wired & Wireless";
        else if (client.wireless) return "Wireless";
        else if (client.wired) return "Wired";
        else return "Unkown";
    }

    $scope.removeFilter = function () {
        $scope.query.filter = '';
        
      };
      
      $scope.$watch('query.filter', function (newValue, oldValue) {
        if(!oldValue) {
          bookmark = $scope.query.page;
        }
        
        if(newValue !== oldValue) {
          $scope.query.page = 1;
        }
        
        if(!newValue) {
          $scope.query.page = bookmark;
        }
        
        $scope.getDesserts();
      });

    $scope.refresh = function () {
        if ($scope.requestInit) $scope.requestInit.abort();
        $scope.requestInit = initService();
        $scope.requestInit.then(function (promise) {
            if (promise && promise.error) console.log("ERR", promise.error)
            else if (promise) {
                $scope.clients = promise.data.clients;
                console.log($scope.clients)
            }
        })
    }

    $scope.refresh();

});
