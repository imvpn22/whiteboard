
var def_log = (e, err = true) => {
    var dt = (new Date()).toLocaleString();
    console.log("[" + (err ? "ERROR" : "INFO ") + " | " + dt + "]: " + e);
}

const def_headers = {
    "Content-Type": "application/json;charset=utf-8"
}

var ajaxp = (_url, _data, _headers, success, error = def_log) => {
    if (!window.XMLHttpRequest) {
        def_log("Cancelled ajax call. Perhaps update the browser?");
        return;
    }
    
    var xhr = new XMLHttpRequest();
    let callback = () => {
        if (xhr.readyState == XMLHttpRequest.DONE) {
            if (xhr.status == 200) {
                success(xhr.responseText);
            } else {
                def_log("Server responded with code: " + xhr.status);
                error(xhr.responseText);
            }
        }
    };
    
    xhr.onreadystatechange = callback.bind(xhr);
    xhr.withCredentials = true;
    
    xhr.open("POST", _url, true);
    for (var key in _headers) {
        if (_headers.hasOwnProperty(key))
            xhr.setRequestHeader(key, _headers[key]);
    }
    xhr.send(_data);
} 

var signup = (_name, _usern, _email, _password) => {
    // Populate user data
    app.setUserName(_usern);
    app.setUserInfo({ name: _name, email: _email });
    
    let userd = {
        "username": app.user.username,
        "password": _password,
        "email": app.user.email
    };
    
    ajaxp(
        app.urls.auth + "signup", JSON.stringify(userd), def_headers,
        (sdata) => {
            def_log("Received data: " + sdata, false);
            
            let user = JSON.parse(sdata);
            app.setUserInfo({
                hasura_id: user["hasura_id"],
                hasura_roles: user["hasura_roles"],
                auth_token: user["auth_token"]
            });

            // Save profile data to server
            let prof_data = {
                "type": "insert",
                "args": {
                    "table": "profile",
                    "objects": [{
                        "id": app.user.id,
                        "name": app.user.name
                    }]
                }
            };
            
            ajaxp(
                app.urls.data + "v1/query", JSON.stringify(prof_data), def_headers,
                (sresp) => {
                    let resobj = JSON.parse(sresp);
                    def_log(resobj["message"], false);
                    
                    def_log("Signup complete. Redirecting to app...", false);
                    window.location.href = "/";
                }
            );
        },
        (edata) => {
            def_log("Signup failed. Please try again... (" + edata + ")");
        }
    );
}

var login = (_usern, _password) => {
    // Populate user data
    app.setUserName(_usern);
    
    let userd = {
        "username": app.user.username,
        "password": _password,
    };
    
    ajaxp(
        app.urls.auth + "login", JSON.stringify(userd), def_headers,
        (sdata) => {
            def_log("Received data: " + sdata, false);
              
            let user = JSON.parse(sdata);
            app.setUserInfo({
                hasura_id: user["hasura_id"],
                hasura_roles: user["hasura_roles"],
                auth_token: user["auth_token"]
            });
            
            def_log("Login complete. Redirecting to app...", false);
            window.location.href = "/";
        },
        (edata) => {
            def_log("Login failed. Please try again... (" + edata + ")");
        }
    );
}

var logout = () => {
    if (!app.user.token) return;
    
    ajaxp(
        app.urls.auth + "user/logout", "", def_headers,
        (sresp) => {
            def_log("User logged out", false);
            window.location.href = "/";
        }
    );
    app.clearSession();
}

var get_profile = () => {
    if (!app.user.token){
        alert("Not logged in !");
        return;
    } 
    
    ajaxp(
        app.urls.auth + "user/account/info", "", def_headers,
        
        (sdata) => {
            def_log("Received data: " + sdata, false);
              
            let user = JSON.parse(sdata);
            window.location.href = "/profile";
            
        },
        (edata) => {
            def_log("Get Profile Failed. Please try again... (" + edata + ")");
        }
    );
}