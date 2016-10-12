function printbooks(books){
    $('.searchList').text('');

    if(books.length > 0) $('.searchList').show();
    else $('.searchList').hide();

    for(var i = 0; i < books.length; i++){
        var option = $('<option></option>')
            .text(books[i].title).click(function(){

            $('#title').val(this.innerHTML);
            $('.searchList').text('').hide();
        });
        $('.searchList').append(option);
    }
}
function Search(val){
    search(val);
    if($('#title').val() == '') $('.searchList').text('').hide();
}

function Uploader(){
    var title = $('#title').val();
    if(title != ''){
        $.ajax({
            method: 'get',
            url: '/book/title/'+title,
            success: function(books){
                if(books.length == 0) showPopupClass('bookCreate');
                else {
                    var book = {
                        bookid: books[0].id,
                        name: $('#chapter').val(),
                        pages: null
                    }
                    uploadchapter(book);
                }
            },
            error: function(xhr){
                showError(xhr.responseText);
            }
        });
    } else showError('You must have a title');
}


function uploadchapter(book){
    hidePop();
    if(book != null){
        function uploadchap(){
            $.ajax({
                method: 'post',
                url: '/chapter',
                data: book,
                success: function(row){
                    window.location.href = '/chapter/'+row.insertId;
                },
                error: function(xhr){ 
                    showError(xhr.responseText);
                }
            });
        }
        var files = $('#pages').get(0).files;
        uploadFiles(files, function(err, links){
            book.pages = links.toString();
            if(err) {
                //do the confirm
                showConfirm('There was a problem uploading all images - ('+links.length + ' of ' + files.length + ' images where uploaded). Do you wish to upload the book anyway?',
                    uploadchap);
            }
            else uploadchap();
        });
    } else showError('Chapter cant be updloaded, no book set'); //just in case
}

function uploadbook(){

    var book = {
        title: $('#title').val(),
        author: $('#author').val(),
        summery: $('#summery').val(),
        tags: $('#tags').val(),
        bookid: -1, // this is only for the chapter uploader later..
        pages: null,// same for this
        name: $('#chapter').val() //as for this
    }
    if(validateText(book.author)) {
        if(validateText(book.tags)) {
            if(validateText(book.summery)){
                //everything is ok
                $.ajax({
                    method: 'post',
                    url: '/book',
                    data: book,

                    success: function(row){
                        book.bookid = row.insertId;

                        uploadchapter(book);
                    },
                    error: function(xhr){
                        showError(xhr.responseText);
                    }
                });

            } else $('#summery').val('').attr('placeholder', '*Not a valid value');
        } else $('#tags').val('').attr('placeholder', '*Not a valid value');
    } else $('#author').val('').attr('placeholder', '*Not a valid value');
}