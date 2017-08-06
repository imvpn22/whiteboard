
    var auth_url = "http://auth.c100.hasura.me";
    var data_url = "http://data.c100.hasura.me";

    $('#signup_btn').on('click', function () {
        var $name = $('#name');
        var $usern = $('#username');
        var $pass = $('#password');
        var $email = $('#email');
        var $user = {
            username: $usern.val(),
            password: $pass.val(),
            email: $email.val()
        };

        $.ajax({
            method: 'POST',
            url: auth_url + '/signup',
            xhrFields: {
                withCredentials: true
            },
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify($user),
        }).done(function (data){
            console.log(data);
            window.location = '/profile';
        }).fail(function (error){
            console.log(error);
            window.location = '/signup';

        });

    });



    $('#login_btn').on('click', function () {
        var $usern = $('#username');
        var $pass = $('#password');
        var $user = {
            username: $usern.val(),
            password: $pass.val(),
        };

        $.ajax({
            method: 'POST',
            url: auth_url + '/login',
            xhrFields: {
                withCredentials: true
            },
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify($user),
        }).done(function (data){
            console.log(data);
            window.location = '/profile';
        }).fail(function (error){
            console.log(error);
            window.location = '/login';

        });

    });

