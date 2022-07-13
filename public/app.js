var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data:{
        // data members go here
        page: "map",

        // Register Page
        rUsername: "",
        rEmail: "",
        rPass:"",
        rConfirmPass:"",
        rZip: "",

        lEmail: "",
        lPassword: "",

        links: [
            'Dashboard',
            'Messages',
            'Profile',
            'Updates',
        ]



    },
    methods:{
        // methods go here
        setPage: function(page){
            this.page = page
            console.log("setPage")
        },
        initMap: function() {
            map = new google.maps.Map(document.getElementById("map"), {
              center: { lat: -34.397, lng: 150.644 },
              zoom: 8,
            });
          }
    }
})
  