
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

var signup = (_name, _usern, _email, _password, done, fail) => {
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

            // Save user data to server
            let prof_data = {
                "type": "insert",
                "args": {
                    "table": "user_info",
                    "objects": [{
                        "id": app.user.id,
                        "username": app.user.username,
                        "name": app.user.name,
                        "about": ""
                    }]
                }
            };
            
            ajaxp(
                app.urls.data + "v1/query", JSON.stringify(prof_data), def_headers,
                (sresp) => {
                    let resobj = JSON.parse(sresp);
                    def_log(sresp, false);
                    
                    // Call user callback
                    done(sdata);
                }
            );
        },
        (edata) => { fail(edata); }
    );
}

var login = (_usern, _password, done, fail) => {
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
            
            // Call user callback
            done(sdata);
        },
        (edata) => { fail(edata); }
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
    if (!app.user.token) {
        console.log("Not logged in!");
        return;
    } 
    
    ajaxp(
        app.urls.auth + "user/account/info", "", def_headers,
        (sdata) => {
            let user = JSON.parse(sdata);
            document.getElementById("profile_username").innerHTML = user["username"];
            document.getElementById("profile_role").innerHTML = user["hasura_roles"];
            document.getElementById("profile_email").innerHTML = user["email"];
            document.getElementById("profile_mobile").innerHTML = user["mobile"];
            document.getElementById("profile_id").innerHTML = user["hasura_id"];
            document.getElementById("profile_token").innerHTML = user["auth_token"];           
        },
        (edata) => {
            def_log("Get Profile Failed. Please try again... (" + edata + ")");
        }
    );
}

var generic_ug_get = (filter_tbl, query_tbl, filter_col, query_col, filter_data, success, error) => {
    success = success || def_log;
    error = error || def_log;

    let query = {
        "type": "select",
        "args": {
            "table": filter_tbl,
            "columns": [query_col],
            "where": {}
        }
    };
    query['args']['where'][filter_col] = filter_data;

    ajaxp(
        app.urls.data + "v1/query", JSON.stringify(query), def_headers,
        (sresp) => {
            let resobj = JSON.parse(sresp);

            let id_list = [];
            for (var i = 0; i < resobj.length; i++) {
                id_list.push(resobj[i][query_col]);
            }

            let query = {
                "type": "select",
                "args": {
                    "table": query_tbl,
                    "columns": ["*"],
                    "where": {
                        "id": { "$in": id_list }
                    }
                }
            };

            ajaxp(
                app.urls.data + "v1/query", JSON.stringify(query), def_headers,
                (sdata) => { success(sdata, false); },
                (edata) => { error(edata); }
            );
        }
    );
}

var get_groups = (success, error) => {
    if (!app.user.token) return undefined;
    generic_ug_get("user_group", "group_info", "user_id", "group_id", app.user.id, success, error);
}

var get_users = (gid, success, error) => {
    if (!app.user.token || !group_id) return undefined;
    generic_ug_get("user_group", "user_info", "group_id", "user_id", gid, success, error);
}

var add_group = (group_name, success = def_log, error = def_log) => {
    if (!app.user.token || !group_name) return undefined;

    // Add a new group to server
    let prof_data = {
        "type": "insert",
        "args": {
            "table": "group_info",
            "objects": [{
                "name": group_name
            }],
            "returning": [ "id" ]
        }
    };

    ajaxp(
        app.urls.data + "v1/query", JSON.stringify(prof_data), def_headers,
        (sresp) => {
            let resobj = JSON.parse(sresp);
            def_log(sresp, false);

            // Add returned group to user_group
            let ug_data = {
                "type": "insert",
                "args": {
                    "table": "user_group",
                    "objects": [{
                        "user_id": app.user.id,
                        "group_id": resobj['returning'][0]['id'],
                        "admin": true
                    }]
                }
            };

            ajaxp(
                app.urls.data + "v1/query", JSON.stringify(ug_data), def_headers,
                (sdata) => { success(sdata, false); },
                (edata) => { error(edata); }
            );
        }
    );
}

var add_user = (username, group_id, success = def_log, error = def_log) => {
    if (!app.user.token || !username || !group_id) return undefined;

    // Check if user exists
    let query = {
        "type": "select",
        "args": {
            "table": "user_info",
            "columns": ["id"],
            "where": {
                "username": username
            }
        }
    };

    ajaxp(
        app.urls.data + "v1/query", JSON.stringify(query), def_headers,
        (sresp) => {
            let resobj = JSON.parse(sresp);
            def_log(sresp, false);

            if (resobj.length === 0)
                def_log("Username: " + username + " not available");
            else {
                let uid = resobj[0]["id"];

                let ug_data = {
                    "type": "insert",
                    "args": {
                        "table": "user_group",
                        "objects": [{
                            "user_id": uid,
                            "group_id": group_id,
                            "admin": false
                        }]
                    }
                };

                ajaxp(
                    app.urls.data + "v1/query", JSON.stringify(ug_data), def_headers,
                    (sdata) => { success(sdata, false); },
                    (edata) => { error(edata); }
                );
            }
        }
    );
}