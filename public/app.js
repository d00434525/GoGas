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
        rEmail: "",
        rPass:"",
        rConfirmPass:"",
        rZip: "",
        dialog: true,
        dialogScreen: "home",
        guest: false,

        lUsername: "",
        lPassword: "",

        errorOccurred: false,
        errorMessage: "",
        successOccurred: false,
        successMessage: "",

        // Gas station stuff
        allStations: [],
        currentStation: "",
        currentStationPrices: [],
        sparklineGradient: ["#FFB17A", "yellow"],

        // rating stuff
        rating: 0,

        //MAP
        map: null,
        geocoder: null,

        // displays a placeholder if false
        mapIsInitialized: false,

        // if you want to look at the most recent marker object in the console:
        recentMarker: null,

        addressInput: "",


    },
    methods:{
        // methods go here
        setPage: function(page){
            this.page = page
            console.log("setPage")
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
                this.successMessage = "User successfully created.";
                this.successOccurred = true;
                // this.UpdateServer();
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
                    this.map.setCenter(results[0].geometry.location);
                    this.map.setZoom(16);

                    // creates new marker
                    var marker = new google.maps.Marker({
                        map: this.map,
                        position: results[0].geometry.location,
                    });
                    this.recentMarker = marker;
                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
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
    },
    created: function () {
        this.getStations();
    }
})
  
// This function is a callback that is given to the google api
// It is ran when the api has finished loading
function initMap() {
    // geocoder is for turning an address (1234 E 5678 S) into Latitude and Longitude
    GEOCODER = new google.maps.Geocoder();

    // Center on the map on St. George using the Geocoder
    GEOCODER.geocode({'address' : 'St. George, UT'}, function (results, status) {
        switch (status) {
        case "OK":
            // creates the map
            MAP = new google.maps.Map(document.getElementById("map"), {
                zoom: 14,
                center: results[0].geometry.location,
                styles: myStyles,
            });
            // calls vue's initialize map function
            app.initializeMap();
            break;
        default:
            console.error('Geocode was not successful for the following reason: ' + status);
        }
    });
}