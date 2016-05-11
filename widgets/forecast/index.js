'use strict';

// Fades icons out and in (and handles loading them)
let changeIcon = function (element, icon) {
    let url = `url('${__dirname}/icons/${icon}.png')`;
    if (element.css('-webkit-mask-image') !== url) {
        if (element.css('-webkit-mask-image') === 'url(' + window.location.origin + '/)') {
            element.addClass('loading');
            element.addClass('prepare-loading');
            element.css('-webkit-mask-image', url);
            element.removeClass('loading');
            setTimeout(function () {
                element.removeClass('prepare-loading');
            }, 500);
        } else {
            element.addClass('prepare-loading');
            element.addClass('loading');
            setTimeout(function () {
                element.css('-webkit-mask-image', url);
                element.removeClass('loading');
                setTimeout(function () {
                    element.removeClass('prepare-loading');
                }, 500);
            }, 500);
        }
    }
};

// Maps a value in range A to a value in range B
let map = function (x, in_min, in_max, out_min, out_max) {
    return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};

// Returns a readable (N, S, E, W, etc) bearing based on degrees
let bearing = function (bearing) {
    var direction_index = Math.round(bearing / 45);
    return ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'][direction_index];
};

let unit_labels = {
    auto: {
        speed: 'mph'
    },
    us: {
        speed: 'mph'
    },
    si: {
        speed: 'm/s'
    },
    ca: {
        speed: 'km/h'
    },
    uk: {
        speed: 'mph'
    }
};

let dayMapping = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat'
};

const API_INSTRUCTIONS = '<b>Installation Instructions</b><br>Replace "API_KEY" in index.js with an API key obtained from https://developer.forecast.io/';

module.exports = {
    name: 'forecast',
    restrict: 'E',
    transclude: true,
    scope: {},
    styles: 'style.scss',
    controller: ($scope, $element, $http) => {
        const API_KEY = '<api_key>'; // Put your Forcast.io api key inside the quotes here          #
        const REFRESH_RATE = 120000; // Time in milliseconds between refreshes                     #
        let LAT = 'auto'; // Options are auto, or a valid latitude (auto doesn't always work)    #
        let LON = 'auto'; // Options are auto, or a valid longitude (auto doesn't always work)   #
        const UNITS = 'auto'; // Options are us, si, ca, uk, auto                                  #
        // const ONCLICK_LINK = 'http://www.wunderground.com'; // Link to open when widget is clocked #
        let URL = '';

        $scope.cssClasses = 'loading';

        $scope.days = [];
        for (let i = 0; i < 8; i++) {
            $scope.days[i] = {
                text: 'asdf',
                icon: 'asdf',
                style: {
                    top: '0px',
                    bottom: '0px'
                }
            };
        }

        // Runs after retrieving new weather data
        let updateView = (output) => {
            // Make sure that we have valid JSON (first run is empty, no api key is Forbidden)
            if (output && output !== '' && output !== 'Forbidden\n') {

                // Temperature direction (rising or falling)
                var next_hour_temp = output.hourly.data[1].temperature; // Next hour's temp
                var current_temp = output.currently.temperature; // Current temp
                if (next_hour_temp > current_temp) {
                    $scope.tempDirection = 'and rising';
                } else {
                    $scope.tempDirection = 'and falling';
                }

                // Temperature and summary
                $scope.temp = Math.round(current_temp);
                $scope.summary = output.currently.summary;

                // Wind speed and bearing
                var wind_speed = Math.round(output.currently.windSpeed);
                var wind_speed_units = unit_labels[UNITS || 'us'].speed;
                var wind_bearing = bearing(output.currently.windBearing);
                $scope.wind = 'Wind: ' + wind_speed + ' ' + wind_speed_units + ' (' + wind_bearing + ')';

                // Icon
                changeIcon(angular.element($element[0].querySelector('#fe-current-icon')), output.currently.icon);

                // TODO: Check if there is a output.weekly.high / low
                // Find the max and min temperatures for the week
                var temp_min_week = 1000;
                var temp_max_week = -1000;
                for (var day in output.daily.data) {
                    if (output.daily.data[day].temperatureMax > temp_max_week) {
                        temp_max_week = output.daily.data[day].temperatureMax;
                    }
                    if (output.daily.data[day].temperatureMin < temp_min_week) {
                        temp_min_week = output.daily.data[day].temperatureMin;
                    }
                }

                for (day in output.daily.data) {

                    // Change current day's name
                    if (day === '0') {
                        // $('#day' + day).find('.day-text').text('Tod');
                        $scope.days[day].text = 'Tod';
                    } else {
                        // $('#day' + day).find('.day-text').text(dayMapping[new Date(output.daily.data[day].time * 1000).getDay()]);
                        $scope.days[day].text = dayMapping[new Date(output.daily.data[day].time * 1000).getDay()];
                    }

                    // Set day's weather icon
                    changeIcon(angular.element($element[0].querySelector(`#day${day} .weather-icon`)), output.daily.data[day].icon);

                    // Temperature bars
                    var day_high = Math.round(output.daily.data[day].temperatureMax) + '°';
                    var day_low = Math.round(output.daily.data[day].temperatureMin) + '°';
                    var day_high_rel = map(output.daily.data[day].temperatureMax, temp_min_week, temp_max_week, 0, 1);
                    var day_low_rel = map(output.daily.data[day].temperatureMin, temp_min_week, temp_max_week, 0, 1);
                    var height = 100;
                    angular.element($element[0].querySelector(`#day${day} .bar`)).attr('data-content-high', day_high);
                    angular.element($element[0].querySelector(`#day${day} .bar`)).attr('data-content-low', day_low);
                    $scope.days[day].style.top = `${Math.round(height - (day_high_rel * height))}px`;
                    $scope.days[day].style.bottom = `${Math.round(day_low_rel * height)}px`;
                }

                // Makes the widget visible after it's loaded
                $element.children().removeClass('loading');

            } else {
                // Show an error message if API key is invalid
                if (output === 'Forbidden\n') {
                    var widget = $element[0];
                    widget.html(API_INSTRUCTIONS);
                    widget.css('text-shadow', '1px 1px 15px rgb(0, 0, 0)');
                    widget.css('font-weight', 900);
                    widget.css('font-size', '20px');
                }
            }
        };

        let getWeatherData = () => {
            $http({method: 'GET', url: URL}).then((res) => {
                updateView(res.data);
            });
        };

        let ready = () => {
            getWeatherData();
            setInterval(function () {
                getWeatherData();
            }, REFRESH_RATE);
        };

        if (LAT === 'auto' && LON === 'auto') {
            navigator.geolocation.getCurrentPosition((position) => {
                console.log(position);
                LAT = position.coords.latitude;
                LON = position.coords.longitude;
                URL = `https://api.forecast.io/forecast/${API_KEY}/${LAT},${LON}?units=${UNITS}&exclude=minutely,alerts,flags`;
                ready();
            }, (error) => {
                console.log(error);
            });
        } else {
            URL = `https://api.forecast.io/forecast/${API_KEY}/${LAT},${LON}?units=${UNITS}&exclude=minutely,alerts,flags`;
            ready();
        }

        var widget = $element[0];

        // Show an error if no API key is set
        if (API_KEY === 'API_KEY') {
            widget.innerHTML(API_INSTRUCTIONS);
            widget.style.textShadow = '1px 1px 15px rgb(0, 0, 0)';
            widget.style.fontWeight = 900;
            widget.style.fontSize = '20px';
            return;
        }

        // Opens a specified link when the widget is clicked
        widget.click(function () {
            // uber.run('open ' + uber.onclick_link, function () {});
        });
    },
    templateUrl: `template.html`
};
