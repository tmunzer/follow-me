var login = angular.module('login', [
    'ngMaterial', 'ngSanitize', 'pascalprecht.translate'
]);

login
.config(function ($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette("grey", {
            'default': '900'
        })
        .accentPalette('amber', {
            'default': '600' // by default use shade 400 from the pink palette for primary intentions
        });
}).config(function ($translateProvider) {
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

login.controller('LoginCtrl', function ($scope) {
    $scope.vpcUrl = "";
    $scope.ownerId = "";
    $scope.accessToker = "";
    $scope.tlsOp = true;

});

