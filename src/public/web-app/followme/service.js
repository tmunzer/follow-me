angular.module('Follow')
    .factory("initService", function ($http, $q) {
        function init(startTime, endTime) {
            const params = {
                startTime: startTime,
                endTime: endTime
            };
            var canceller = $q.defer();
            var request = $http({
                url: "/api/init",
                method: 'GET',
                params: params,
                timeout: canceller.promise
            });
            var promise = request.then(
                function (response) {
                    return response;
                },
                function (response) {
                    if (response.status && response.status >= 0) {
                        return response;
                    }
                });

            promise.abort = function () {
                canceller.resolve();
            };
            promise.finally(function () {
                console.info("Cleaning up object references.");
                promise.abort = angular.noop;
                canceller = request = promise = null;
            });

            return promise;

        }

        return init;
    });

