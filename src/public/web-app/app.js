angular.module("Follow", []);
angular.module("Modals", []);
var follow = angular.module("follow", [
    "ngRoute",
    'ngSanitize',
    'ngMaterial',
    'ngMessages',
    'md.data.table',
    'ui.bootstrap',
    'pascalprecht.translate',
    'Follow',
    'Modals'
]);

follow
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("grey", {
                'default': '900'
            })
            .accentPalette('blue', {
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
            .translations('fr', fr)
            .registerAvailableLanguageKeys(['en', 'fr'], {
                'en_*': 'en',
                'fr_*': 'fr',
                '*': 'en'
            })
            .determinePreferredLanguage()
            .fallbackLanguage('en')
            .useSanitizeValueStrategy('sanitize');

    });



follow.controller("HeaderCtrl", function ($scope, $rootScope, $location, $mdDialog) {
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


});


