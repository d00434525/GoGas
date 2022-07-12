import Vue from 'vue'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)


var app = new Vue({
    el: "#app",
    data:{
        // data members go here
        page: "register",

        // Register Page
        rUsername: "",
        rEmail: "",
        rPass:"",
        rConfirmPass:"",
        rZip: "",

        lEmail: "",
        lPassword: ""



    },
    methods:{
        // methods go here
        setPage: function(page){
            this.page = page
            console.log("setPage")
        }
    }
})
  