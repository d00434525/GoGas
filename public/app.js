const URL = 'http://localhost:8080';

var MAP;
var GEOCODER;

// disables poi's (Points of Interest)
const myStyles = [
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
              { visibility: "off" }
        ]
    }
];

var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data:{
        // data members go here
        page: "main",

        // Register Page
        rUsername: "",
        rName: "",
        rPass:"",
        rConfirmPass:"",
        rZip: "",
        dialog: true,
        dialogScreen: "home",
        guest: false,

        lUsername: "",
        lPassword: "",
        loggedIn: true,

        errorOccurred: false,
        errorMessage: "",
        successOccurred: false,
        successMessage: "",
        successfullyCreated: false,

        // Gas station stuff
        allStations: [],
        currentStation: "",
        currentStationPrices: [],
        sparklineGradient: ["#FFB17A", "yellow"],
        currentStationDialog: false,
        newCurrentPrice: "",

        // rating stuff
        rating: 0,
        comment: "",

        //MAP
        map: null,
        geocoder: null,

        // displays a placeholder if false
        mapIsInitialized: false,

        // if you want to look at the most recent marker object in the console:
        recentMarker: null,

        addressInput: "",
        markers: [],


    },
    methods:{
        // methods go here
        setPage: function(page){
            this.page = page;
        },

        // get all gas stations
        getStations: async function () {
            let response = await fetch(`${URL}/stations`);

            // Parse response body
            let body = await response.json();
            console.log(body);

            // Check if stations were retrieved
            if (response.status == 200) {
                console.log("Successful station retrieval");
                this.allStations = body;
            } else {
                console.log("error GETTING /stations", response.status, response);
            }
        },
        
        // load station page
        loadStationPage: function () {
            this.page = 'station';
        },

        // get gas station by id
        getSingleStation: async function (id) {
            let response = await fetch(URL + "/station/" + id);

            // check response status
            if (response.status == 200) {
                let data = await response.json();
                this.currentStation = data;
                data.prices.forEach(price => {
                    this.currentStationPrices.push(price.price);
                });
                this.loadStationPage();
            } else {
                console.error("Error fetching individual request with id", id, "- status:", response.status);
            }
        },
        addUser: async function () {
            let newUser = {
                username: this.rUsername,
                password: this.rPass,
                name: this.rName,
                zip: this.rZip,
            }

            let response = await fetch('http://localhost:8080/user', {
                method: "POST",
                body: JSON.stringify(newUser),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            // parse the response body
            let body;
            try {
                body = response.json();
            } catch (error) {
                console.error("Error parsing body as JSON:", error);
                body = "An Unknown Error has occurred";
            }

            if (response.status == 201) {
                console.log(response, "User succesfully created.");
                // console.log("Welcome,", this.rName);
                // user succesfully created
                this.rUsername = "";
                this.rPass = "";
                this.rConfirmPass = "";
                this.rName = "";
                this.rZip = "";

                // take user to login page HERE:
                this.dialogScreen = "login";
                this.successfullyCreated = true;
                this.successMessage = "Successfully Created User."
            } else {
                // error creating user
                this.rPass = "";
            }
        },

        registerUser: function() {
            if (this.rUsername == ""){
                this.errorOccurred = true;
                this.errorMessage = "You must enter a username.";
                console.log("needs username");
                return;
            }
            else if (this.rPass == ""){
                this.errorOccurred = true;
                this.errorMessage = "You must enter a password.";
                return;
            }
            else if (this.rConfirmPass == ""){
                this.errorOccurred = true;
                this.errorMessage = "You must confirm your password.";
                return;
            }
            else if (this.rName == ""){
                this.errorOccurred = true;
                this.errorMessage = "You must enter a name."
            }
            else if (this.rZip == ""){
                this.errorOccurred = true;
                this.errorMessage = "You must enter a Zip code.";
                return;
            }
            else if (this.rPass != this.rConfirmPass){
                this.errorOccurred = true;
                this.errorMessage = "Passwords don't match.";
                return;
            }
            else {
                this.addUser();
            }
        },
        loginUser: async function () {
            // attempt to login
            let loginCredentials = {
                username: this.lUsername,
                password: this.lPassword
            };

            let response = await fetch('http://localhost:8080/session', {
                method: "POST",
                body: JSON.stringify(loginCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            // parse the body
            let body;
            try {
                body = response.json();
                console.log(body);
            } catch (error) {
                console.log("Response body was not json")
            }

            // check - was the login successfull
            if (response.status == 201) {
                // successfull login
                console.log("Welcome,", this.lUsername);

                // clear inputs
                this.lUsername = "";
                this.lPassword = "";

                // take the user to the home page
                this.page = 'main';
                this.dialog = false;
                this.guest = false;

                 // reload page
                window.location.reload(); 
            }
        },

        // get session
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                method: "GET",
                credentials: "include"
            });

            // Check if logged in
            if (response.status == 200) {
                // logged in
                console.log("logged in");
                let data = await response.json();
                console.log(data);
                this.page = 'main';
                this.dialog = false;
                this.guest = false;  
                this.dialogScreen = 'main';
            } else if (response.status == 401) {
                // not logged in
                console.log("not logged in");
                let data = await response.json();
                console.log(data);
                this.loggedIn = false;
            } else {
                console.log("error GETTING /session", response.status, response);
            }
        },

        //Map Methods
        addMarker: function (parameterAddress = null) {
            let address = "";
            if (parameterAddress !== null) {
                address = parameterAddress;
            } else {
                address = this.addressInput;
            }
            
            // uses geocode api to look up address
            GEOCODER.geocode( {'address': address}, (results, status) => {
                if (status == 'OK') {
                    // centers/zooms map
                    // this.map.setCenter(results[0].geometry.location);
                    // this.map.setZoom(16);
                    
                    // creates new marker
                    var marker = new google.maps.Marker({
                        map: this.map,
                        position: results[0].geometry.location,
                    });
                    this.recentMarker = marker;
                } else {
                    console.log('Geocode was not successful for the following reason: ' + status);
                }
                this.addressInput = "";
            });
        },
        initializeMap: function () {
            console.log(MAP);
            this.map = MAP;
            this.geocoder = GEOCODER;
            this.mapIsInitialized = true;
        },
        addMarkers: function(stations){
            stations.forEach(station => {
                this.addMarker(station.address);
                console.log(station.address);
            });
        },
        centerMarker: function () {
            this.map.setCenter(this.currentStation.geometry.location);
            this.map.setZoom(16);
        },

        // Post review on a station
        postReview: async function (id) {
            let postBody = {
                rating: this.rating,
                comment: this.comment,
                station_id: id
            }

            let response = await fetch(URL + "/review", {
                method: "POST",
                body: JSON.stringify(postBody),
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include"
            });

            if (response.status == 201) {
                // created successfully
                this.rating = 0;
                this.comment = "";
                this.getSingleStation(id);
            } else {
                console.log("Error posting review:", response.status);
            }
        },

        logoutUser: function () {
            try {
                fetch(`${URL}/logout`, {
                    method: "DELETE",
                });
                this.guest = true;
                this.loggedIn = false;
                // reload page
                window.location.reload();   
            } catch (err) {
                console.log(err)
            }
        },
        reloadMap: function() {
            initMap();
        },
        itWorked: function(){
            console.log("it worked?")
        },
        // Post price on a station
        postPrice: async function (id) {
            let postBody = {
                price: parseFloat(this.newCurrentPrice),
                station_id: id
            }

            let response = await fetch(URL + "/price", {
                method: "POST",
                body: JSON.stringify(postBody),
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include"
            });

            if (response.status == 201) {
                // created successfully
                this.newCurrentPrice = "";
                this.getSingleStation(id);
            } else {
                console.log("Error posting price:", response.status);
            }
        },

        // Get all current station prices
        getAllPrices: function (station) {
            return station.prices[station.prices.length -1].price
        }
    },
    created: function () {
        this.getSession();
        this.getStations();
    }
})

// This function is a callback that is given to the google api
// It is ran when the api has finished loading
function initMap(address = null) {
    // geocoder is for turning an address (1234 E 5678 S) into Latitude and Longitude
    GEOCODER = new google.maps.Geocoder();

    // Center on the map on St. George using the Geocoder
    GEOCODER.geocode({'address' : 'St. George, UT'}, function (results, status) {
        switch (status) {
        case "OK":
            // creates the map
                MAP = new google.maps.Map(document.getElementById("map"), {
                    zoom: 13,
                    center: results[0].geometry.location,
                    styles: myStyles,
                });
            // } else {
            //     MAP = new google.maps.Map(document.getElementById("map"), {
            //         zoom: 16,
            //         center: this.currentStation.address.geometry.location,
            //         styles: myStyles,
            //     });
            // }
            //add station markers
            app.addMarkers(app.allStations)
            // calls vue's initialize map function
            app.initializeMap();
            break;
        default:
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}