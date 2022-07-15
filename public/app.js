const URL = 'http://localhost:8080';

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

        // rating stuff
        rating: 0,

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
                console.log("Welcome,", this.rName);
                // user succesfully created
                this.rUsername = "";
                this.rPass = "";
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
        }
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