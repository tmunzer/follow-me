angular.module('follow').config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "/web-app/followme/view.html",
            module: "Follow",
            controller: "FollowCtrl"
        })
        .otherwise({
            redirectTo: "/"
        });
});