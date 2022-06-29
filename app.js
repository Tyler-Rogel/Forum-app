const URL = "https://forum2022.codeschool.cloud"

var app = new Vue({
    el: "#app",
    data: {
        loginEmailInput: "",
        loginPasswordInput: "",

        newEmailInput: "",
        newPasswordInput:"",
        newFullnameInput: "",

        page: "loginPage",

        loggedinUser: "",
        loginCookies: false,
    },
    methods: {
        //GET /session to ask the server if we are logged in.
        getSession: async function () {
            let response = await fetch(`${URL}/session`,{
                method: "GET",
                credentials: "include"
            });
           //Logged in??
           if (response.status == 200){
            console.log("logged in");
            let data = await response.json();
            console.log(data);
            this.loginCookies = true;
            this.loggedinUser = this.loginEmailInput;
           } else if (response.status == 401){
            console.log("Not Logged In")
            let data = await response.json();
            console.log(data);

           } else {
            console.log("Some sort of Error when GETTING /session:" , response.status, response);
           }
        },
        //POST /session Attempts to login
        postSession: async function () {
            let loginCredentials = {
                username: this.loginEmailInput, 
                password: this.loginPasswordInput
            };

            let response = await fetch(`${URL}/session`,{
                method: "POST",
                body: JSON.stringify(loginCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //parse response body
            let body = response.json();
            console.log(body);

            //good login?
            if (response.status == 201) {
                console.log("successful login")
                //clear inputs but make sure to save the email
                this.loggedinUser = this.loginEmailInput;
                this.loginEmailInput = "";
                this.loginPasswordInput = "";
                this. page = "loggedinPage";
            
            } else if (response.status == 401){
                //tell the user its a bad login
                console.log("unsuccessful login attempt")
                alert("unsuccessful login attempt")
            //clear password input
                this.loginPasswordInput = "";
            } else {
                console.log("some error when POSTING /session:", response.status, response);
            }
        },
        
        postUser: async function () {
            let newCredentials = {
                username: this.newEmailInput, 
                password: this.newPasswordInput,
                fullname: this.newFullnameInput,
            };

            let response = await fetch(`${URL}/user`,{
                method: "POST",
                body: JSON.stringify(newCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            //parse response body
            let body = response.json();
            console.log(body);

           
        },
        
    },
    created: function () {
        this.getSession();
    }
})