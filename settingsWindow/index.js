'use strict';

module.exports = ['$dasherSettings', ($dasherSettings) => {
    let settingsWindow = {
        name: 'settingsWindow',
        restrict: 'E',
        transclude: true,
        scope: {},
        styles: 'style.scss',
        controller: ($scope, $element) => {
            $dasherSettings.get('demoSetting').then((setting) => {
                $scope.demoSetting = setting;
            });

            let requestedQuestions = [
                {
                    question: 'First Name',
                    key: 'firstName'
                },
                {
                    question: 'Last Name',
                    key: 'lastName'
                },
                {
                    question: 'Email',
                    key: 'email'
                }
            ];
            $dasherSettings.get(requestedQuestions).then((settings) => {
                $scope.demoSettings = settings;
            });
        },
        templateUrl: `template.html`
    };

    return settingsWindow;
}];
