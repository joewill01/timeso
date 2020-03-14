// PREFERENCES
let version = 16;

let current_atco;

const app = new Vue({
    el: "#app",
    data: { predictions: [], stationName: '' },
    mounted() {
        axios.interceptors.request.use(function(config) {
            $('#modal-1').toggleClass("md-show");
            return config;
        }, function(error) {
          return Promise.reject(error);
        });

        axios.interceptors.response.use(function (response) {
            $('#modal-1').toggleClass("md-show");
          return response;
        }, function (error) {
          return Promise.reject(error);
        });

    },
});

function get_times(atco = 'blank') {
    if (atco !== 'blank') {
        current_atco = atco;
    }

    axios.get(`https://transportapi.com/v3/uk/bus/stop/${current_atco}/live.json?app_id=c3e7de7c&app_key=7e0ced32fcfcfc3afe87056d60680d74`)
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

function open_times(atco) {
    anime({
        easing: "easeOutExpo",
        duration: 500,
        targets: "#times",
        left: 0
    });

    get_times(atco);
}

function close_times() {
    anime({
        easing: "easeOutExpo",
        duration: 500,
        targets: "#times",
        left: "100%"
    })
}

function show_update() {
    let changes_animation = new anime.timeline({
        easing: "easeOutExpo",
        duration: 750,
    });

    changes_animation
    .add({
        targets: "#changelog",
        top: 0,
    })
    .add({
        targets: "#info",
        height: "140px",
        opacity: 1
    }, 1500)
}

function close_update() {
    anime({
        easing: "easeOutExpo",
        duration: 750,
        targets: "#changelog",
        top: "100%"
    })
}

function changeTab(tab_button, change_to) {
    let all_tabs = tab_button.parentElement.getElementsByClassName("tab");
    let all_pages = tab_button.parentElement.parentElement.getElementsByClassName("page");

    for (let tab of all_tabs) {
        tab.classList.remove("active");
    }

    for (let page of all_pages) {
        page.classList.remove("show")
    }

    tab_button.classList.add("active");
    document.getElementById(change_to).classList.add("show");
}

function changeColorMode(color_mode) {
    let root = document.documentElement;

    if (color_mode === 'dark') {
        root.style.setProperty("--bar-color", "var(--dark-bar-color)");
        root.style.setProperty("--main-color", "var(--dark-main-color)");
        root.style.setProperty("--secondary-color", "var(--dark-secondary-color)");
        root.style.setProperty("--line-color", "var(--dark-line-color)");
        root.style.setProperty("--main-text-color", "var(--dark-main-text-color)");
        root.style.setProperty("--secondary-text-color", "var(--dark-secondary-text-color)");
        root.style.setProperty("--navbar-bg-color", "var(--dark-navbar-bg-color)");
        root.style.setProperty("--navbar-border-color", "var(--dark-navbar-border-color)");
        root.style.setProperty("--navbar-text-color", "var(--dark-navbar-text-color)");
        root.style.setProperty("--navbar-button-color", "var(--dark-navbar-button-color)");
        root.style.setProperty("--tabbar-bg-color", "var(--dark-tabbar-bg-color)");
        root.style.setProperty("--tabbar-border-color", "var(--dark-tabbar-border-color)");
        root.style.setProperty("--tabbar-icon-color", "var(--dark-tabbar-icon-color)");
        root.style.setProperty("--tabbar-icon-selected-color", "var(--dark-tabbar-icon-selected-color)");
        root.style.setProperty("--toolbar-button-color", "var(--dark-toolbar-button-color)");
        root.style.setProperty("--toolbar-bg-color", "var(--dark-toolbar-bg-color)");
        root.style.setProperty("--toolbar-border-color", "var(--dark-toolbar-border-color)");
        root.style.setProperty("--switch-selected-color", "var(--dark-switch-selected-color)");
        root.style.setProperty("--switch-unselected-color", "var(--dark-switch-unselected-color)");
        root.style.setProperty("--switch-toggle-color", "var(--dark-switch-toggle-color)");

        document.getElementById("dark_mode_switch").checked = true;

    } else if (color_mode === 'light') {
        root.style.setProperty("--bar-color", "var(--light-bar-color)");
        root.style.setProperty("--main-color", "var(--light-main-color)");
        root.style.setProperty("--secondary-color", "var(--light-secondary-color)");
        root.style.setProperty("--line-color", "var(--light-line-color)");
        root.style.setProperty("--main-text-color", "var(--light-main-text-color)");
        root.style.setProperty("--secondary-text-color", "var(--light-secondary-text-color)");
        root.style.setProperty("--navbar-bg-color", "var(--light-navbar-bg-color)");
        root.style.setProperty("--navbar-border-color", "var(--light-navbar-border-color)");
        root.style.setProperty("--navbar-text-color", "var(--light-navbar-text-color)");
        root.style.setProperty("--navbar-button-color", "var(--light-navbar-button-color)");
        root.style.setProperty("--tabbar-bg-color", "var(--light-tabbar-bg-color)");
        root.style.setProperty("--tabbar-border-color", "var(--light-tabbar-border-color)");
        root.style.setProperty("--tabbar-icon-color", "var(--light-tabbar-icon-color)");
        root.style.setProperty("--tabbar-icon-selected-color", "var(--light-tabbar-icon-selected-color)");
        root.style.setProperty("--toolbar-button-color", "var(--light-toolbar-button-color)");
        root.style.setProperty("--toolbar-bg-color", "var(--light-toolbar-bg-color)");
        root.style.setProperty("--toolbar-border-color", "var(--light-toolbar-border-color)");
        root.style.setProperty("--switch-selected-color", "var(--light-switch-selected-color)");
        root.style.setProperty("--switch-unselected-color", "var(--light-switch-unselected-color)");
        root.style.setProperty("--switch-toggle-color", "var(--light-switch-toggle-color)");

        document.getElementById("dark_mode_switch").checked = false;
    }
}

function toggleDarkMode(checkbox) {
    if (checkbox.checked) {
        changeColorMode("dark");
        localStorage.setItem("color_mode", "dark");
    } else {
        changeColorMode("light");
        localStorage.setItem("color_mode", "light");
    }
}

window.onload = function() {
    if (localStorage.getItem("version") < version) {
        show_update();
        localStorage.setItem('version', version)
    }

    if (localStorage.getItem("color_mode") === "dark") {
        changeColorMode("dark");
    } else {
        changeColorMode("light");
    }

};