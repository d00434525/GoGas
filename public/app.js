var app = new Vue({
    el: "#app",
    data:{
        // data members go here
        page: "home",

        // Register Page
        rUsername: "",
        rEmail: "",
        rPass:"",
        rConfirmPass:"",
        rZip: ""


    },
    methods:{
        // methods go here
        setPage: function(page){
            this.page = page
            console.log("setPage")
        }
    }
})
  