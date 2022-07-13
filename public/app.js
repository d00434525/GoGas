var app = new Vue({
    el: "#app",
    vuetify: new Vuetify(),
    data:{
        // data members go here
        page: "home",

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
        }
    }
})
  