const URL = 'http://localhost:8080';

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

        lEmail: "",
        lPassword: "",

        links: [
            'Dashboard',
            'Messages',
            'Profile',
            'Updates',
        ],

        // Gas station stuff
        allStations: [],
        currentStation: "",
        currentStationPrices: [],
        sparklineGradient: ["#FFB17A", "yellow"],

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
  