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
        $.post('/login', {
            user: user,
            pass: pass
        }, function(err){
            if(err != 'done'){
                console.log(err);
                $('#error').text(err);
            }
            else {
                window.location.href = "/";
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
            $.post('/register', {
                user: user,
                pass: pass,
                mail: mail
            }, function(err){
                if(err != 'done'){
                    console.log(err);
                    $('#errorr').text(err);
                }
                else {
                    alert("a registration request has been made, check your email");
                    window.location.href = "/login";
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