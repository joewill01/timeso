const app = new Vue({
    el: "#app",
    data: { predictions: [], stationName: '' },
    mounted() { get_times() }
});


function get_times() {
    axios.get("http://transportapi.com/v3/uk/bus/stop/43000312304/live.json?app_id=b3bcf524&app_key=954ba16e33264c93d56fd1cb79dc3d30")
    .then(response => {

        let currentTime = moment(response['request_time'], 'YYYY-MM-DDThh:mm:ss+00:00');
        let arrivalTime = '';

        for (let service in response['data']['departures']) {
            if (response['data']['departures'].hasOwnProperty(service)) {
                for (let journey in response['data']['departures'][service]) {
                    if (response['data']['departures'][service].hasOwnProperty(journey)) {
                        journey = response['data']['departures'][service][journey];

                        arrivalTime = moment((journey['expected_departure_date'] + 'T' + journey['best_departure_estimate']), 'YYYY-MM-DDThh:mm');

                        app.predictions.push(journey['line_name'] + journey['direction']);

                    }
                }
            }
        }
    })
}


function get_timess() {
    axios.get("https://cors-anywhere.herokuapp.com/http://api.tfwm.org.uk/StopPoint/43000312301/Arrivals?app_id=3f1c6cd7&app_key=7f46797c63d120abde6f83c36bbbf3d6&formatter=JSON")
    .then(response => {
        let time = '';
        let api_data = response.data['Predictions']['Prediction'];

        app.predictions = [];

        for (let prediction in api_data) {
            if (api_data.hasOwnProperty(prediction)) {

                let timeToArrival = 0;
                let timeToArrivalReadable = '';
                let arrivalTime = '';
                let live = false;

                time = moment(api_data[prediction]['TimeToLive'], 'YYYY-MM-DDThh:mm:ss+01');

                if (api_data[prediction]['ExpectedArrival'] !== '') {
                    live = true;
                    arrivalTime = moment(api_data[prediction]['ExpectedArrival'], 'YYYY-MM-DDThh:mm:ss+01');
                } else {
                    live = false;
                    arrivalTime = moment(api_data[prediction]['ScheduledArrival'], 'YYYY-MM-DDThh:mm:ss+01');
                }

                timeToArrival = Math.round(moment.duration(arrivalTime - time).asMinutes());

                if (timeToArrival > 1) {
                    timeToArrivalReadable = timeToArrival.toString() + ' mins'
                } else if (timeToArrival === 1) {
                    timeToArrivalReadable = timeToArrival.toString() + ' min'
                } else if (timeToArrival === 0) {
                    timeToArrivalReadable = 'Due'
                }

                app.predictions.push({
                    'id': api_data[prediction]['Id'],
                    'bus': api_data[prediction]['LineName'].toUpperCase(),
                    'destination': api_data[prediction]['Towards'],
                    'timeToArrival': timeToArrival,
                    'timeToArrivalReadable': timeToArrivalReadable,
                    'arrivalTime': arrivalTime,
                    'live': live
                });


                app.predictions.sort(function (a, b) {
                    return a.arrivalTime - b.arrivalTime
                });

                app.stationName = api_data[prediction]["StationName"];
            }
        }
    })
}
