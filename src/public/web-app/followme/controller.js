

angular.module('Follow')
    .controller("FollowCtrl", function ($scope, $mdDialog, initService) {
        $scope.requestInit = undefined;
        $scope.colors = [ '#97bbcd', '#4D5360', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1'];
        $scope.os = {
            loading : true,
            data: [],
            labels: [],
            options: {
                legend: {
                    display: true,
                    position: "right"
                }
            }
        }
        $scope.concurent = {
            loading : true,
            data: [],
            labels: [],
            series: ["max", "average"],
            datasetOverride: [
                {
                    type: 'line',
                    display: true,
                    position: 'left',
                    fill: false
                },
                {
                    type: 'line',
                    display: true,
                    position: 'left',
                }],
            options: {
                
                maintainAspectRatio: false
            }
        }

        /* 
        DISPLAY FUNCTIONS
        */
        let clients = [];
        $scope.clients = [];
        $scope.query = {
            limit: 10,
            limitOptions: [5, 10, 20, 50],
            page: 1,
            order: 'clientMac',
            filterOptions: {
                debounce: 500
            },
            filter: ''
        }

        $scope.connectionType = connectionType;

        function connectionType(client) {
            if (client.wireless && client.wired) return "Wired & Wireless";
            else if (client.wireless) return "Wireless";
            else if (client.wired) return "Wired";
            else return "Unkown";
        }

        /* 
        FILTER
        */
        $scope.removeFilter = removeFilter;

        function removeFilter() {
            $scope.query.filter = '';
            $scope.clients = clients;
        };

        $scope.$watch('query.filter', function (newValue, oldValue) {
            if (newValue == '') $scope.removeFilter()
            else if (newValue !== oldValue) {
                $scope.clients = [];
                const filter = newValue.toLowerCase();
                clients.forEach(function (client) {
                    if ((client.clientMac && client.clientMac.toLowerCase().indexOf(filter) >= 0)
                        || (client.hostName && client.hostName.toLowerCase().indexOf(filter) >= 0)
                        || (client.ip && client.ip.toLowerCase().indexOf(filter) >= 0))
                        $scope.clients.push(client);

                })
            }

        });

        /* 
        DATETIME PICKER
        */
        $scope.dateRangeEnd = new Date();
        $scope.dateRangeStart = new Date(new Date().setHours($scope.dateRangeEnd.getHours() - 12));
        $scope.endDateBeforeRender = endDateBeforeRender;
        $scope.startDateBeforeRender = startDateBeforeRender;

        function startDateBeforeRender($dates) {
            if ($scope.dateRangeEnd) {
                var activeDate = moment($scope.dateRangeEnd);

                $dates.filter(function (date) {
                    return date.localDateValue() >= activeDate.valueOf()
                }).forEach(function (date) {
                    date.selectable = false;
                })
            }
        }

        function endDateBeforeRender($view, $dates) {
            if ($scope.dateRangeStart) {
                var activeDate = moment($scope.dateRangeStart).subtract(1, $view).add(1, 'minute');
                $dates.filter(function (date) {
                    return date.localDateValue() <= activeDate.valueOf()
                }).forEach(function (date) {
                    date.selectable = false;
                })

            }
            activeDate = moment(new Date()).add(1, 'minute');
            $dates.filter(function (date) {
                return date.localDateValue() > activeDate.valueOf()
            }).forEach(function (date) {
                date.selectable = false;
            })
        }

        $scope.clientInfo = clientInfo;
        function clientInfo(client) {
            $mdDialog.show({
                controller: 'DetailsController',
                templateUrl: 'details/view.html',
                locals: {
                    items: client
                }
            });
        }

        /**
         * CHARTS
         */

        function chartOs(os) {
            $scope.os.data = [];
            $scope.os.label = [];

            for (var key in os) {
                $scope.os.label.push(key);
                $scope.os.data.push(os[key]);
            }
            $scope.os.loading = false;
        }

        function chartConcurent(sessions) {
            $scope.concurent.data = [];
            $scope.concurent.labels = [];
            let max = [];
            let average = [];

            for (var key in sessions) {
                $scope.concurent.labels.push(key);
                max.push(sessions[key].max);
                average.push(sessions[key].average);
            }
            $scope.concurent.data = [max, average];
            $scope.concurent.loading = false;
        }
        /* 
        ENTRY POINT AND LOADING FUNCTION
        */
        $scope.refresh = refresh;
        function refresh() {
            if ($scope.requestInit) $scope.requestInit.abort();
            $scope.os.loading=true;
            $scope.concurent.loading=true;
            $scope.requestInit = initService($scope.dateRangeStart, $scope.dateRangeEnd);
            $scope.requestInit.then(function (promise) {
                if (promise && promise.error) console.log("ERR", promise.error)
                else if (promise) {
                    clients = promise.data.clients;
                    $scope.clients = clients;
                    chartOs(promise.data.os);
                    chartConcurent(promise.data.averageConcurentSessions);
                }
            })
        }

        $scope.refresh();
    })



    .filter('highlight', function ($sce) {
        return function (text, filter) {
            if (filter && text) text = text.replace(new RegExp('(' + filter + ')', 'gi'),
                '<span class="highlighted">$1</span>')

            return $sce.trustAsHtml(text)
        }
    });

