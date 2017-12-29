angular.module("Check", []);
angular.module("Modals", []);
var att = angular.module("att", [
    "ngRoute",
    'ngSanitize',
    'ngMaterial',
    'ngMessages',
    'md.data.table',
    'Check',
    'Modals',
    'btford.socket-io',
    'ui.bootstrap',
    'pascalprecht.translate'
]);

att
    .factory('socketio', function (socketFactory) {
        var socket = io.connect('/' + nsp, {
            'sync disconnect on unload': true
        });
        var factory = socketFactory({
            ioSocket: socket
        });
        return factory
        //return socketFactory();
    })
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue", {
                'default': '600'
            })
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
            });
    })
    .config(['$httpProvider', function ($httpProvider) {
        //initialize get if not there
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }

        // Answer edited to include suggestions from comments
        // because previous version of code introduced browser-related errors

        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        // extra
        $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
        $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
    }])
    .config(function ($translateProvider) {
        $translateProvider.useMissingTranslationHandlerLog();
        $translateProvider
            .translations('en', en)
            .registerAvailableLanguageKeys(['en'], {
                '*': 'en'
            })
            .determinePreferredLanguage()
            .fallbackLanguage('en')
            .usePostCompiling(true)
            .useSanitizeValueStrategy("escapeParameters");

    }
    ).run(['$anchorScroll', function ($anchorScroll) {
        $anchorScroll.yOffset = 150;   // always scroll by 50 extra pixels
    }]);



att.controller("HeaderCtrl", function ($scope, $rootScope, $location, $mdDialog) {
    $rootScope.xapi = {
        vpcUrl: angular.element("#vpcUrl").val(),
        ownerId: angular.element("#ownerId").val(),
        accessToken: angular.element("#accessToken").val(),
    }

    $scope.about = function () {
        $mdDialog.show({
            controller: 'DialogDetailsController',
            templateUrl: 'modals/modalXapiInfo.html',
            locals: {
                items: $rootScope.xapi
            }
        });
    }

    $scope.openMenu = function ($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
    };

    $scope.translate = function (langKey) {
        $translate.use(langKey);
    }
    $scope.appDetails = {};

    $scope.nav = {};
    $scope.nav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[1]) return true;
        else return false;
    };
    $scope.subnav = {};
    $scope.subnav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[2]) return true;
        else return false;
    };


});


