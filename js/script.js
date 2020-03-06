// PREFERENCES
let timeso_version = 1;


const app = new Vue({
    el: "#app",
    data: { predictions: [], stationName: '' },
    mounted() {
        axios.interceptors.request.use(function(config) {
            $('#modal-1').toggleClass("md-show"); //you can list several class names

            return config;
        }, function(error) {
          return Promise.reject(error);
        });

        axios.interceptors.response.use(function (response) {
            $('#modal-1').toggleClass("md-show"); //you can list several class names
          return response;
        }, function (error) {
          return Promise.reject(error);
        });

        get_times();
    },
});

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+ d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function get_times() {
    axios.get("https://transportapi.com/v3/uk/bus/stop/43000312301/live.json?app_id=c3e7de7c&app_key=7e0ced32fcfcfc3afe87056d60680d74")
    .then(response => {

        app.stationName = response['data']['stop_name'];
        app.predictions = [];

        let currentTime = moment(response['data']['request_time'], 'YYYY-MM-DDThh:mm:ss+00:00');

        for (let service in response['data']['departures']) {
            if (response['data']['departures'].hasOwnProperty(service)) {
                for (let journey in response['data']['departures'][service]) {
                    if (response['data']['departures'][service].hasOwnProperty(journey)) {

                        let arrivalTime = '';
                        let timeToArrival = 0;
                        let timeToArrivalReadable = '';
                        let live = false;

                        journey = response['data']['departures'][service][journey];

                        arrivalTime = moment((journey['date'] + 'T' + journey['best_departure_estimate']), 'YYYY-MM-DDThh:mm');

                        timeToArrival = Math.round(moment.duration(arrivalTime - currentTime).asMinutes());

                        if (timeToArrival > 1) {
                            timeToArrivalReadable = timeToArrival.toString() + ' mins'
                        } else if (timeToArrival === 1) {
                            timeToArrivalReadable = timeToArrival.toString() + ' min'
                        } else if (timeToArrival === 0) {
                            timeToArrivalReadable = 'Due'
                        }

                        if (journey['expected_departure_time']) {
                            live = true;
                        }

                        app.predictions.push({
                                'id': journey['id'],
                                'bus': journey['line_name'].toUpperCase(),
                                'destination': journey['direction'],
                                'timeToArrival': timeToArrival,
                                'timeToArrivalReadable': timeToArrivalReadable,
                                'arrivalTime': arrivalTime,
                                'live': live
                            })
                    }
                }
            }
        }

        app.predictions.sort(function (a, b) {
            return a.arrivalTime - b.arrivalTime
        });
    })
}

function show_update() {
    changes_animation = new anime.timeline({
        easing: "easeOutExpo",
        duration: 1000,
    })

    changes_animation
    .add({
        targets: "#changelog",
        top: 0,
    })
    .add({
        targets: "#info",
        height: "100px",
        opacity: 1
    }, 1500)
}

function close_update() {
    anime({
        easing: "easeOutExpo",
        duration: 1000,
        targets: "#changelog",
        top: "100%"
    })
}

window.onload = function() {
show_update();
/*
    if (getCookie("timeso_version") < version) {
        show_update();
        setCookie("timeso_version", version, 999999999)
    }

*/
}
