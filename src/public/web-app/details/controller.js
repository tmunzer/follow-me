angular.module('Details').controller('DetailsController', function ($scope, $mdDialog, detailService, items) {
    // items is injected in the controller, not its scope!
    client = items;
    sessions = [];
    $scope.requestDetails;
    $scope.sessions = [];
    $scope.details = {};

    $scope.query = {
        limit: 10,
        limitOptions: [5, 10, 20, 50],
        page: 1,
        order: 'sessionStart',
        filterOptions: {
            debounce: 500
        },
        filter: ''
    }

    /* 
    FILTER
    */
    $scope.removeFilter = removeFilter;

    function removeFilter() {
        $scope.query.filter = '';
        $scope.sessions = sessions;
    };

    $scope.$watch('query.filter', function (newValue, oldValue) {
        if (newValue == '') $scope.removeFilter()
        else if (newValue !== oldValue) {
            $scope.sessions = [];
            const filter = newValue.toLowerCase();
            sessions.forEach(function (session) {
                if ((session.ssid && session.ssid.toLowerCase().indexOf(filter) >= 0)
                    || (session.hostName && session.hostName.toLowerCase().indexOf(filter) >= 0)
                    || (session.hostName && session.userName.toLowerCase().indexOf(filter) >= 0)
                    || (session.userProfile && session.userProfile.toLowerCase().indexOf(filter) >= 0)
                    || (session.vlan && session.vlan.toLowerCase().indexOf(filter) >= 0)
                    || (session.ip && session.ip.toLowerCase().indexOf(filter) >= 0))
                    $scope.sessions.push(session);
            })
        }

    });


    $scope.getInfo = getInfo;
    function getInfo() {
        $scope.requestDetails = detailService(client.clientId);
        $scope.requestDetails.then(function (promise) {
            if (promise && promise.error) console.log("ERR", promise.error)
            else if (promise) {
                $scope.details = promise.data.details;
                sessions = promise.data.sessions;
                $scope.sessions = sessions;
            }
        })
    }
    getInfo();

    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});
