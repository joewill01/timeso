const app = new Vue({
    el: "#app",
    data: {
        predictions: []
    },

    mounted() {
        axios.get("https://cors-anywhere.herokuapp.com/http://api.tfwm.org.uk/StopPoint/43000312301/Arrivals?app_id=3f1c6cd7&app_key=7f46797c63d120abde6f83c36bbbf3d6&formatter=JSON")
        .then(response => {
            let time = '';
            let api_data = response.data['Predictions']['Prediction'];

            for (let prediction in api_data) {
                if (api_data.hasOwnProperty(prediction)) {

                    let timeToArrival = '';
                    let arrivalTime = '';
                    let live = false;

                    time = moment(api_data[prediction]['TimeToLive'], 'YYYY-MM-DDThh:mm:ss+01');

                    if (api_data[prediction]['ExpectedArrival'] !== '') {
                        live = true;
                        arrivalTime = moment(api_data[prediction]['ExpectedArrival'], 'YYYY-MM-DDThh:mm:ss+01').unix();
                        timeToArrival = moment(api_data[prediction]['ExpectedArrival'], 'YYYY-MM-DDThh:mm:ss+01') - time;
                        timeToArrival = moment(timeToArrival).format('hh:mm:ss');
                    }

                    else {
                        live = false;
                        arrivalTime = moment(api_data[prediction]['ScheduledArrival'], 'YYYY-MM-DDThh:mm:ss+01').unix();
                        timeToArrival = moment(api_data[prediction]['ScheduledArrival'], 'YYYY-MM-DDThh:mm:ss+01') - time;
                        timeToArrival = moment(timeToArrival).format('hh:mm:ss');
                    }

                    this.predictions.push({
                        'bus': api_data[prediction]['LineName'].toUpperCase(),
                        'destination': api_data[prediction]['Towards'],
                        'timeToArrival': timeToArrival,
                        'arrivalTime': arrivalTime,
                        'live': live
                    });

                    this.predictions.sort(function(a, b){return a.arrivalTime - b.arrivalTime});
                }
            }
        })
    }
});
