'use strict';

module.exports = ['$dasherSettings', ($dasherSettings) => {
    let settingsWindow = {
        name: 'settingsWindow',
        restrict: 'E',
        transclude: true,
        scope: {},
        styles: 'style.scss',
        controller: ($scope) => {
            $dasherSettings.get('settingsWindow', 'demoSetting', undefined, undefined, true).then((setting) => {
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
                    key: 'email',
                    type: 'email'
                },
                {
                    question: 'Favorite widget dashboard',
                    key: 'favoriteWidgetDashboard',
                    type: 'spinner',
                    options: [
                        {
                            text: 'Dasher',
                            value: 'dasher1'
                        },
                        {
                            text: 'Dasher',
                            value: 'dasher2'
                        },
                        {
                            text: 'Dasher',
                            value: 'dasher3'
                        }
                    ]
                },
                {
                    question: 'Password',
                    key: 'password',
                    type: 'password'
                }
            ];
            $dasherSettings.get('settingsWindow', requestedQuestions).then((settings) => {
                $scope.demoSettings = settings;
            });
        },
        templateUrl: `template.html`
    };

    return settingsWindow;
}];
