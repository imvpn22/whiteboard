$('#signup_btn').on('click', function () {
    var $name = $('#name');
    var $usern = $('#username');
    var $pass = $('#password');
    var $email = $('#email');
    
    // Populate user data
    app.setUserName($usern.val());
    app.setUserInfo({
        name: $name.val(),
                    email: $email.val(),
    });
    
    var userd = {
        username: app.user.username,
        password: $pass.val(),
                    email: app.user.email
    };
    
    $.ajax({
        method: 'POST',
        url: app.urls.auth + "signup",
        
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(userd)
    }).done(function(user) {
        console.log("Received data: " + user);
        console.log("Successfully signed up. Redirecting to app...");
        
        // Save critical data
        var user_obj = JSON.parse(user);
        app.setUserInfo({
            hasura_id: user_obj.hasura_id,
            hasura_roles: user_obj.hasura_roles,
            auth_token: user_obj.auth_token
        });
        
        // Save additional user data to server
        var prof_data = {
            "type": 'insert',
            "args": {
                "table": 'profile',
            "objects": [{
                "id": app.user.id,
            "name": app.user.name
            }]
            }
        };
        
        $.ajax({
            method: 'POST',
            url: app.urls.data + 'v1/query',
            
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(prof_data)
        }).done(function(data) {
            console.log(data);
            
            // Redirect to application
            window.location = "/app";
        }).fail((e) => { console.log(e); });
    }).fail((e) => {
        // Handle errors
        // Premise: No change of page (dynamically generated)
        if (e) {
            console.log(e);
            console.error("Signup error! Reason: " + e.responseText);
        } else {
            console.error("Fuck e");
        }
    });
});
