function show_login(){
    $("#register").css("display", "none");
    $("#login").css("display", "block");

    $('#1').addClass('active');
    $('#2').removeClass('active');

    $('title').text('Login');
}
function show_register(){
    $("#login").css("display", "none");
    $("#register").css("display", "block");

    $('#2').addClass('active');
    $('#1').removeClass('active');

    $('title').text('Register');
}

function login(){
    var user = $("#username_login").val(),
        pass = $("#password_login").val();

    if(user != '' && validateTextMore(user) && validateTextMore(pass) && pass != ''){
        $.ajax({
            method: 'post',
            url: 'login',
            data: {
                username: user,
                password: pass
            },
            success: function(ans){
                window.location.href = "/";
            },
            error: function(xhr){
                $('#error').text(xhr.responseText);
            }
        });
    }
    else {
        $('#error').text('you havent put some values yet');
    }
}
function enterpress(e){
    if(e.keyCode == 13){
        if($('#1').hasClass('active')){
            login();
        }
        else {
            register();
        }
    }
}
function register(){
    var user = $("#username_reg").val(),
        pass = $("#password_reg").val(),
        repass = $("#repassword_reg").val(),
        mail = $("#email_reg").val();
    if(user != '' && validateTextMore(user) && pass != '' && validateTextMore(pass) && mail != '' && validateMail(mail)){ // do also filter later!
        if(pass == repass){
            $.ajax({
                method: 'post',
                url: '/authenticate/register',
                data: {
                    password: pass,
                    username: user,
                    mail: mail
                },
                success: function(ans){
                    showSucces("a registration request has been made, check your email", function(){
                        window.location.href = "/authenticate/login";
                    });
                },
                error: function(xhr){
                    $('#errorr').text(xhr.responseText);
                }
            });
        }
        else {
            $('#errorr').text('passwords do not match');
        }
    }
    else {
        $('#errorr').text('you havent put some values yet');
    }
}