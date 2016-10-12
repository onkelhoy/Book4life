var CANLEAVE = true;
window.onbeforeunload = function() {
    if(!CANLEAVE)
        return "Are you sure you want to leave (killing the process)?";
}

function uploadFiles(files, callback){
    var links = [], index = 0;
    CANLEAVE = false;
    $('.container').hide();
    $('.info').show();
    $('span#current').text(0);
    $('span#count').text(files.length);

    function loadLinks(){
        if(index < files.length) {
            upload(files[index], function(err, link){
                if(err) callback(err, links);
                else {
                    links.push(link);
                    index++;
                    $('span#current').text(index);

                    loadLinks();
                }
            });
        }
        else {
            CANLEAVE = true;
            callback(null, links); //its finished}
        }
    }

    loadLinks();
}

function upload(file, callback){
    var reader = new FileReader();

    reader.onload = function(e){
        uploadImage(e, callback);
    }
    reader.readAsDataURL(file);
}

function uploadImage(page, callback){
    var iurl = page.target.result.substr(page.target.result.indexOf(",") + 1, page.target.result.length);
    var clientId = '98fb764612f62b2';
    $.ajax({
        url: "https://api.imgur.com/3/upload",
        type: "POST",
        datatype: "json",
        data: {
            'image': iurl,
            'type': 'base64'
        },
        success: function(data){
            var link = data.data.link;
            callback(null, link);

        },//calling function which displays url
        error: function(xhr){
            //error handleing
            callback(xhr.responseText);
        },
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Client-ID " + clientId);
        }
    });
}