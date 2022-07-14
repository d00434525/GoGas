const URL = 'http://localhost:8080';

var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data:{
        rules: [(value) => !!value || "This field is required."],

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

        errorMessage: "",
        errorOccurred: false,
        successOccurred: false,
        successMessage: "",

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

        registerUser: function() {
            if (this.rUsername == ""){
                this.errorOccurred = true;
                this.errorMessage = "You must enter a username.";
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
        }

        // get single gas station prices
        // getSingleStationPrices: async function (id) {
        //     let response = await fetch(URL + "/station/" + id);

        //     // check response status
        //     if (response.status == 200) {
        //         let data = await response.json();
        //         this.currentStationPrices = data.prices;
        //     } else {
        //         console.error("Error fetching individual request with id", id, "- status:", response.status);
        //     }
        // },
    },
    created: function () {
        this.getStations();
    }
})
  