
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

var signup = (_name, _usern, _email, _password, success, error) => {
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
                    
                    // Create a default group for new user
                    add_group("PGroup (" + app.user.username + ")", () => { success(sdata); });
                }
            );
        },
        (edata) => { error(edata); }
    );
}

var login = (_usern, _password, success, error) => {
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
            success(sdata);
        },
        (edata) => { error(edata); }
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

var get_profile = (success, error) => {
    if (!app.user.token) { error("User not logged in"); return; }

    let query = {
        "type": "select",
        "args": {
            "table": "user_info",
            "columns": [ "name", "about" ],
            "where": {
                "id": app.user.id
            }
        }
    }
    
    ajaxp(
        app.urls.data + "v1/query", JSON.stringify(query), def_headers,
        (sdata) => {
            ajaxp(app.urls.auth + "user/account/info", "", def_headers,
                (sresp) => {
                    let acc_info = JSON.parse(sresp);
                    let usr_info = JSON.parse(sdata)[0];

                    let usr_obj = {};
                    ["name", "about"].map((x) => { usr_obj[x] = usr_info[x]; });
                    ["username", "email", "mobile"].map((x) => { usr_obj[x] = acc_info[x]; });

                    success(JSON.stringify(usr_obj));
                },
                error
            );
        },
        error
    );
}

var get_groups = (success, error) => {
    if (!app.user.token) return undefined;
    
    let query = {
        "type": "select",
        "args": {
            "table": "user_group",
            "columns": [
                {
                    "name": "ug_group",
                    "columns": [ "*" ]
                }
            ],
            "where": { "user_id": app.user.id }
        }
    }

    ajaxp(
        app.urls.data + "v1/query", JSON.stringify(query), def_headers,
        (sdata) => {
            let groups = [];
            let obj = JSON.parse(sdata);

            obj.map((o) => { groups.push(o["ug_group"]); });
            success(JSON.stringify(groups));
        },
        error
    );
}

var get_users = (gid, success, error) => {
    if (!app.user.token || !gid) return undefined;
    
    let query = {
        "type": "select",
        "args": {
            "table": "user_group",
            "columns": [
                "admin",
                {
                    "name": "ug_user",
                    "columns": [ "username", "name" ]
                }
            ],
            "where": { "group_id": gid }
        }
    }

    ajaxp(
        app.urls.data + "v1/query", JSON.stringify(query), def_headers,
        (sdata) => {
            let users = [];
            let obj = JSON.parse(sdata);

            obj.map((o) => {
                users.push({
                    "name": o["ug_user"]["name"],
                    "username": o["ug_user"]["username"],
                    "admin": o["admin"]
                });
            });
            success(JSON.stringify(users));
        },
        error
    );
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

            if (resobj.length === 0)
                error("{\"message\": \"Username not found\"}");
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