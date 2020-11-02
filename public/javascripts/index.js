//Webuploader util
var WebUploaderUtil = (function () {
    var uploader,
        $list = $('#fileList'),
        ratio = window.devicePixelRatio || 1,
        thumbnailWidth = 100 * ratio,
        thumbnailHeight = 100 * ratio,
        uploadedCount = 0,
        allCount = 0;
    var initWebUploader = function (galleryName) {
        $list.empty();
        uploadedCount = 0;
        allCount = 0;

        uploader = WebUploader.create({
            auto: false,
            server: '/api/gallery/upload',
            pick: '#btn-select-pictures',
            fileNumLimit: 10,
            fileVal: "pictures",
            formData: {
                galleryName: galleryName
            },
            accept: {
                title: 'Images',
                extensions: 'gif,jpg,jpeg,bmp,png',
                mimeTypes: 'image/*'
            }
        });
        uploader.on('fileDequeued', function (file) {
            $list.find('div#' + file.id).remove();
            if ($list.find('div.file-item').length == 0) {
                $('#start-upload').prop("disabled", true);
            }
            allCount--;
        });
        uploader.on('fileQueued', function (file) {
            var $item = $(
                '<div id="' + file.id + '" class="file-item border">'
                + '<img>'
                + '<div class="del-file" data-fileid="' + file.id + '">×</div>'
                + '<div class="error"></div>'
                + '</div>'),
                $img = $item.find('img');
            allCount++;
            $item.on("click", '.del-file', function () {
                uploader.removeFile($(this).data('fileid'), true);
            });

            $list.append($item);
            uploader.makeThumb(file, function (error, src) {
                if (error) {
                    console.log("preview image " + file + " failed.", error);
                }
                $img.attr('src', src);
            }, thumbnailWidth, thumbnailHeight);

            if ($list.find('div.file-item').length) {
                $('#start-upload').prop("disabled", false);
            } else {
                $('#start-upload').prop("disabled", true);
            }
        });
        uploader.on('uploadProgress', function (file, percentage) {
            var $li = $('#' + file.id),
                $percent = $li.find('.progress span');

            if (!$percent.length) {
                $percent = $('<p class="progress"><span></span></p>')
                    .appendTo($li)
                    .find('span');
            }
            $percent.css('width', percentage * 100 + '%');
        });
        uploader.on('uploadSuccess', function (file, response) {
            var $li = $('#' + file.id), $error = $li.find('div.error')
            $li.addClass('upload-state-done');
            $error.show().css({ background: "green" }).text("Success");
            console.log('response:', response);
            uploadedCount++;
        });
        uploader.on('error', function (e) {
            console.log('Error:', e);
        });
        uploader.on('uploadError', function (file) {
            var $li = $('#' + file.id), $error = $li.find('div.error');
            $error.show().css({ background: "red" }).text('Upload Error');
        });
        uploader.on('uploadComplete', function (file) {
            $('#' + file.id).find('.progress').remove();
        });
        uploader.on('uploadFinished', function () {
            $('#uploaded-message').html("All files upload finished, need upload " + allCount + " files, upload success " + uploadedCount + " files.");
        });
    };
    var startUpload = function () {
        uploader.upload();
    };
    var destroy = function () {
        uploader.destroy();
        return uploadedCount > 0;
    };
    return {
        init: initWebUploader,
        startUpload: startUpload,
        destroy: destroy
    };
})();

//api request util
var apiRequest = {
    get: function (url, cb, sb) {
        $.ajax({
            type: 'GET',
            dataType: "json",
            url: url,
            success: function (data) {
                if (data.code === 0) {
                    cb && cb(data);
                } else {
                    sb && sb(data.msg);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                sb && sb("GET: [" + url + "] Failed.");
                console && console.log(errorThrown);
            }
        });
    },
    post: function (url, data, cb, sb) {
        $.ajax({
            type: 'POST',
            dataType: "json",
            url: url,
            data: data,
            success: function (data) {
                if (data.code === 0) {
                    cb && cb(data);
                } else {
                    sb && sb(data.msg);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                sb && sb("POST: [" + url + "] Failed.");
                console && console.log(errorThrown);
            }
        });
    }
};

//loading
var loading = {
    show: function () {
        $('#loading-dialog').modal();
    },
    hide: function () {
        setTimeout(function () {
            $('#loading-dialog').modal('hide');
        }, 1000);
    }
};

//tip
var tip = {
    show: function (msg) {
        $('#tip-dialog').data("tip-msg", msg);
        $('#tip-dialog').modal();
    },
    hide: function () {
        $('#tip-dialog').removeData("tip-msg");
        $('#tip-dialog').modal('hide');
    }
};

//binding events
var bindOnceTimeEvents = function () {
    //binding upload-dialog show.bs.modal event
    $('#upload-dialog').on('show.bs.modal', function (event) {
        var id = $('#upload-dialog').data('id');
        $('#uploaded-message').empty();
        console.log("Init webuploader...");
        WebUploaderUtil.init(id);
    });
    //binding upload-dialog hidden.bs.modal event
    $('#upload-dialog').on('hidden.bs.modal', function (event) {
        $('#upload-dialog').removeData('id');
        console.log("Destroy webuploader...");
        var uploadSuccess = WebUploaderUtil.destroy();
        if (uploadSuccess) {
            //close dialog, reloading gallery list
            if (location.hash.indexOf('detail') != -1) {
                goPage(location.hash);
            } else {
                loadAllGallerys();
            }
        }
    });
    //binding delete-dialog show.bs.modal event
    $('#delete-dialog').on('show.bs.modal', function (event) {
        var id = $(event.relatedTarget).data('id')
        $('#delete-gallery-form').data('id', id);
    });
    //binding tip-dialog show.bs.modal event
    $('#tip-dialog').on('show.bs.modal', function (event) {
        var msg = $('#tip-dialog').data('tip-msg')
        $(this).find('p#tip-content').html(msg);
    });
    //photo rename
    $('#rename-photo-dialog').on('show.bs.modal', function (event) {
        var galleryId = $(event.relatedTarget).data('gallery-id');
        var photoId = $(event.relatedTarget).data('photo-id');
        var photoName = $(event.relatedTarget).data('photo-name');

        var errorContainer = $('#rename-photo-dialog').find('.error-container');
        errorContainer.empty();

        $('#rename-photo-form').data("gallery-id", galleryId);
        $('#rename-photo-form').data("photo-id", photoId);
        $('#rename-photo-form #old-name').val(photoName);
    });
    $('#rename-photo-dialog').on('hidden.bs.modal', function (event) {
        $('#rename-photo-dialog').removeData('gallery-id');
        $('#rename-photo-dialog').removeData('photo-id');
        $('#rename-photo-dialog').removeData('photo-name');
    });
    //binding delete-photo-dialog show.bs.modal event
    $('#delete-photo-dialog').on('show.bs.modal', function (event) {
        var galleryId = $(event.relatedTarget).data('gallery-id')
        var photoId = $(event.relatedTarget).data('photo-id')
        $('#delete-photo-form').data('gallery-id', galleryId);
        $('#delete-photo-form').data('photo-id', photoId);
    });
    //gallery rename
    $('#rename-gallery-dialog').on('show.bs.modal', function (event) {
        var galleryId = $(event.relatedTarget).data('id');
        var galleryName = $(event.relatedTarget).data('name');

        var errorContainer = $('#rename-gallery-dialog').find('.error-container');
        errorContainer.empty();

        $('#rename-gallery-form').data("id", galleryId);
        $('#rename-gallery-form .old-name').val(galleryName);
    });
    $('#rename-gallery-dialog').on('hidden.bs.modal', function (event) {
        $('#rename-photo-dialog').removeData('id');
        $('#rename-photo-dialog').removeData('name');
    });

    //binding login-form submit event
    $('#login-form').submit(function () {
        var userName = $('#login-form #userName').val();
        var password = $('#login-form #password').val();
        apiRequest.post("/api/user/login", { userName: userName, password: password }, function (data) {
            $('#error-container').text("Login success, redirecting...");
            setTimeout(function () {
                location.reload();
            }, 1500);
        }, function (msg) {
            $('#error-container').text(msg);
        });
        return false;
    });
    //rename-photo-photo event
    $('#rename-photo-form').submit(function () {
        var galleryId = $(this).data('gallery-id');
        var photoId = $(this).data("photo-id");
        var newName = $('#rename-photo-form #new-name');
        var errorContainer = $(this).find('.error-container');
        if (!newName.val()) {
            newName.focus();
            return;
        }
        apiRequest.post("/api/photo/rename", {
            galleryId: galleryId,
            photoId: photoId,
            newName: newName.val()
        }, function (data) {
            errorContainer.html("Rename photo success, reloading...");
            $('#rename-photo-dialog').modal('hide');
            setTimeout(function () {
                errorContainer.empty();
                location.reload();
            }, 1000);
        }, function (msg) {
            errorContainer.html("Rename photo failed, " + msg);
        });
        return false;
    });
    //binding delete-gallery-form submit event
    $('#delete-gallery-form').submit(function () {
        var $this = $(this);
        var status = $this.find('#delete-status');
        var id = $this.data('id');
        status.html("Deleting...");
        apiRequest.post("/api/gallery/delete", { id: id }, function (data) {
            status.html("Delete success, reloading...");
            $('#delete-dialog').modal('hide');
            setTimeout(function () {
                status.empty();
                $this.data('id', "");
                location.reload();
            }, 1000);
        }, function (msg) {
            status.html(msg);
        });
        return false;
    });
    //binding delete-photo-form submit event
    $('#delete-photo-form').submit(function () {
        var $this = $(this);
        var status = $this.find('.delete-status');
        var galleryId = $this.data('gallery-id');
        var photoId = $this.data('photo-id');
        status.html("Deleting...");
        apiRequest.post("/api/photo/delete", {
            galleryId: galleryId,
            photoId: photoId
        }, function (data) {
            status.html("Delete success, reloading...");
            $('#delete-photo-dialog').modal('hide');
            setTimeout(function () {
                status.empty();
                $this.removeData('gallery-id');
                $this.removeData('photo-id');
                goPage("#detail?id=" + galleryId);
            }, 1000);
        }, function (msg) {
            status.html(msg);
        });
        return false;
    });
    //binding create-gallery-form submit event
    $('#create-gallery-form').submit(function () {
        var status = $(this).find('#error-container');
        var name = $(this).find('#galleryName');
        status.html("Creating gallery...");
        apiRequest.post("/api/gallery/create", {
            galleryName: name.val()
        }, function (data) {
            status.html("Create success, reloading...");
            $('#create-dialog').modal('hide');
            setTimeout(function () {
                loadAllGallerys();
                status.empty();
                name.val("");
            }, 1000);
        }, function (msg) {
            status.html(msg);
        });
        return false;
    });
    //rename-gallery-photo event
    $('#rename-gallery-form').submit(function () {
        var galleryId = $(this).data('id');
        var newName = $('#rename-gallery-form .new-name');
        var errorContainer = $(this).find('.error-container');
        if (!newName.val()) {
            newName.focus();
            return;
        }
        apiRequest.post("/api/gallery/rename", {
            galleryId: galleryId,
            newName: newName.val()
        }, function (data) {
            errorContainer.html("Rename gallery success, reloading...");
            $('#rename-gallery-dialog').modal('hide');
            setTimeout(function () {
                errorContainer.empty();
                location.reload();
            }, 1000);
        }, function (msg) {
            errorContainer.html("Rename gallery failed, " + msg);
        });
        return false;
    });

    //binding start-upload button event
    $(document).on("click", 'button#start-upload', function () {
        WebUploaderUtil.startUpload();
    });
    //binding btn-create-gallery button event
    $(document).on("click", '.btn-create-gallery', function () {
        if (window.user.userName) {
            $('#create-dialog').modal();
        } else {
            tip.show("You have not login, please login first.");
        }
    });
    //binding btn-upload-pictures button event
    $(document).on("click", '.btn-upload-pictures', function () {
        if (window.user.userName) {
            $('#upload-dialog').data("id", $(this).data("id"));
            $('#upload-dialog').modal();
        } else {
            tip.show("You have not login, please login first.");
        }
    });
    //binding btn-view-photo-detail button event
    $(document).on("click", '.btn-view-photo-detail', function () {
        var galleryId = $(this).data('gallery-id');
        var photoId = $(this).data('photo-id');
        goPage("#detail-photo?galleryId=" + galleryId + "&photoId=" + photoId);
    });

    var getParamFromHash = function (hash) {
        if (!hash || hash.indexOf('?') == -1) {
            return "";
        }
        var ret = {}, key = "", value = "";
        hash = hash.match(new RegExp("[\?\&][^\?\&]+=[^\?\&]+", "g"));
        if (hash) {
            for (var i = 0; i < hash.length; i++) {
                var p = hash[i].substring(1);
                key = p.substring(0, p.indexOf('='));
                value = p.substring(p.indexOf('=') + 1);
                if (key && value) {
                    ret[key] = value;
                }
            }
            //if url only has 1 param, return value
            if (hash.length == 1) {
                return value;
            }
            return ret;
        }
        return "";
    };

    $(window).on("hashchange", function () {
        //loading.show();
        if (!location.hash) {
            goPage("#gallery");
            return;
        }

        var hash = location.hash;
        hash = hash.replace(/[\?|&]s=(\d+)/ig, '');

        var param = getParamFromHash(hash);
        var newHash = hash.split('?')[0];

        $('[data-page]').removeClass('cur');

        var newPage = $('[data-page="' + newHash + '"]');
        newPage.addClass('cur');
        oldHash = newHash;

        var pageSetupFunc = singlePageSetup[newHash.substring(1)];
        pageSetupFunc && pageSetupFunc(param);

        //loading.hide();
    });
};

//check user login status with api
var checkUserLogin = function () {
    apiRequest.get("/api/user/isUserLogined", function (data) {
        $('#login-status').html('<span style="color:white;">Hello, ' + data.data + ', welcome back. </span><a class="btn btn-sm btn-primary" href="/api/user/logout">Logout</a>');
        window.user.userName = data.data;
    }, function (msg) {
        $('#login-status').html('<button class="btn btn-sm btn-primary" data-toggle="modal" data-target="#login-dialog">Login</button>');
    });
};

//format datetime to yyyy-MM-dd
var formatTime = function (dateStr) {
    if (!dateStr) {
        return "";
    }
    var date = new Date(dateStr),
        M = date.getMonth() + 1,
        D = date.getDate();
    if (M < 10) {
        M = '0' + M;
    }
    if (D < 10) {
        D = '0' + D;
    }
    return [date.getFullYear(), M, D].join('-');
};

//html render
var htmlRender = (function () {
    //render gallery buttons
    var getGalleryButtons = function (galleryId) {
        var html = [];
        html.push('<a href="#detail?id=' + galleryId + '" class="btn btn-sm btn-outline-secondary">Detail</a>');
        if (window.user.userName) {
            //html.push('<a data-id="' + galleryId + '" class="btn btn-sm btn-outline-secondary btn-upload-pictures">Upload</a>');
            html.push('<button class="btn btn-sm btn-outline-danger" data-id="' + galleryId + '" data-toggle="modal" data-target="#delete-dialog">Delete</button>');
        }
        return html.join('');
    };

    //render detail card buttons
    var getPhotoCardButtons = function (galleryId, photo) {
        console.log(photo.id);
        var html = [];
        html.push('<button data-gallery-id="' + galleryId + '" data-photo-id="' + photo.id + '" class="btn btn-sm btn-outline-secondary btn-view-photo-detail">View</button>');
        if (window.user.userName) {
            html.push('<button type="button" data-gallery-id="' + galleryId + '" data-photo-id="' + photo.id + '" class="btn btn-sm btn-outline-danger" data-toggle="modal" data-target="#delete-photo-dialog">Delete</button>');
        }
        return html.join(' ');
    };

    var galleryItem = function (gallery) {
        var firstPhoto = gallery.cover || {};
        var html = [];
        html.push('<div class="col-md-4">\
            <div class="card mb-4 box-shadow">\
                <img class="card-img-top" src="'+ (firstPhoto.url) + '" style="width: 100%; height: 225px">\
                <div class="card-body">\
                    <p class="card-text">'+ gallery.name + ' (' + (gallery.count > 0 ? gallery.count + 'P' : '<span class="text-danger">No pictures</span>') + ')' + '</p>\
                    <div class="d-flex justify-content-between align-items-center">\
                        <div class="btn-group">'+ getGalleryButtons(gallery.id) + '</div>\
                        <small class="text-muted">'+ formatTime(firstPhoto.time) + '</small>\
                    </div>\
                </div>\
            </div>\
        </div>');
        return html.join('');
    };

    var galleryList = function (gallerys) {
        var html = [];
        if (gallerys.length == 0) {
            html.push('No any gallerys now');
        } else {
            $(gallerys).each(function (index, gallery) {
                html.push(galleryItem(gallery));
            });
        }
        return html.join('');
    };

    var photoItem = function (galleryId, photo) {
        var html = [];
        html.push('<div class="col-md-3">\
            <div class="card mb-3 box-shadow">\
                <img class="photo-top" src="'+ photo.url + '">\
                <div class="card-body">\
                    <p class="card-text">'+ photo.name + '</p>\
                    <div class="d-flex justify-content-between align-items-center">\
                        <div class="btn-group">'+ getPhotoCardButtons(galleryId, photo) + '</div>\
                        <small class="d-sm-none d-lg-block text-muted">'+ formatTime(photo.time) + '</small>\
                    </div>\
                </div>\
            </div>\
        </div>');
        return html.join('');
    };

    var photoList = function (gallery) {
        var photos = gallery.photos;
        var html = [];
        $(photos).each(function (index, photo) {
            html.push(photoItem(gallery.id, photo));
        });
        return html.join('');
    };

    var photoListGalleryIdAndPhotos = function (galleryId, photos) {
        var html = [];
        $(photos).each(function (index, photo) {
            html.push(photoItem(galleryId, photo));
        });
        return html.join('');
    };

    return {
        galleryList: galleryList,
        galleryItem: galleryItem,
        photoList: photoList,
        photoListGalleryIdAndPhotos: photoListGalleryIdAndPhotos,
        photoItem: photoItem
    }
})();

//load gallerys from api
var loadAllGallerys = function () {
    $('#gallerys-list').empty();
    apiRequest.get("/api/gallery?s=" + +new Date(), function (data) {
        var gallerys = data.data;
        $('#gallerys-list').append(htmlRender.galleryList(gallerys));
    }, function (msg) {
        tip.show(msg);
    });
};

//gallery page function
var galleryPageFunction = function (p) {
    //index page search event
    $(document).on('click', '#btn-search-gallerys', function () {
        var k = $('#search-gallery-keywords').val();
        if (!k) {
            tip.show("Please input gallery name to search.");
            return;
        }
        goPage("#search-gallery?keywords=" + k);
    });

    loadAllGallerys();
};

//gallery detail page
var galleryDetailPageFunction = function (p) {
    //detail page search event
    $(document).on('click', '#btn-search-photos', function () {
        var k = $('#search-photo-keywords').val();
        if (!k) {
            tip.show("Please input photo name to search.");
            return;
        }
        goPage("#search-photo?galleryId=" + p + "&keywords=" + k);
    });

    var getDetailPageButtons = function (gallery) {
        var html = [];
        if (window.user.userName) {
            html.push('<button class="btn btn-sm btn-primary btn-upload-pictures" data-id="' + gallery.id + '">Upload Pictures</button>');
            html.push('<button class="btn btn-sm btn-primary" data-id="' + gallery.id + '" data-name="' + gallery.name + '" data-toggle="modal" data-target="#rename-gallery-dialog">Rename</button>');
            html.push('<button class="btn btn-sm btn-danger" data-id="' + gallery.id + '" data-toggle="modal" data-target="#delete-dialog">Delete</button>');
        }
        return html.join(' ');
    };

    var getDetailPagePhotosHtml = function (gallery) {
        var photos = gallery.photos;
        var html = [];
        if (photos.length == 0) {
            html.push('No any pictures, <a data-id="' + gallery.id + '" class="btn-upload-pictures">Upload picture now</a>');
        } else {
            html.push(htmlRender.photoList(gallery));
        }
        return html.join('');
    };

    var galleryDetailUrl = "/api/gallery/detail?id=" + p + "&s=" + +new Date();
    //load gallery detail from api
    apiRequest.get(galleryDetailUrl, function (data) {
        if ($("#photo-list").data('masonry')) {
            $("#photo-list").masonry('destroy');
        }
        var gallery = data.data;
        $('#gallery-name').html(gallery.name);
        $('#gallery-buttons').html(getDetailPageButtons(gallery));
        $('#gallery-counter').html(gallery.photos.length + ' pictures');
        $('#photo-list').html(getDetailPagePhotosHtml(gallery));
        $('#photo-list').imagesLoaded(function () {
            $("#photo-list").masonry({
                itemSelector: '.col-md-3'
            });
        });
    }, function (msg) {
        //gallery not exist, show tip and redirect to home page
        tip.show(msg);
        setTimeout(function () {
            tip.hide();
            goPage("#gallery");
        }, 1500);
    });
};

//search gallery page
var searchGalleryPageFunction = function (keywords) {
    $('#search-page-gallery-keywords').val(keywords);
    $('#search-gallery-tip').html("Search Gallerys With Name \"<b>" + keywords + "</b>\"");

    //search gallery page event
    $(document).on('click', '#search-page-gallery-searchbtn', function () {
        var k = $('#search-page-gallery-keywords').val();
        if (!k) {
            tip.show("Please input gallery name to search.");
            return;
        }
        goPage("#search-gallery?keywords=" + k);
    });

    apiRequest.get("/api/gallery/search?keywords=" + keywords, function (data) {
        var gallerys = data.data;
        $('#search-gallery-counter').html(gallerys.length + " gallerys");
        if (gallerys.length) {
            $('#search-gallery-list').html(htmlRender.galleryList(gallerys));
        } else {
            $('#search-gallery-list').html("<p class='col-12 text-center'>No results with keywords \"<b>" + keywords + "</b></p>");
        }
    }, function (msg) {
        $('#search-gallery-list').html("<p>" + msg + "</p>");
    });
};

//search photo page
var searchPhotoPageFunction = function (p) {
    //console.log(p);

    var galleryId = p["galleryId"];
    var keywords = p["keywords"];
    $('#search-page-photo-keywords').val(keywords);
    $('#search-photo-tip').html("Search Photos With Name \"<b>" + keywords + "</b>\"");

    //search photo page event
    $(document).on('click', '#search-page-photo-searchbtn', function () {
        var k = $('#search-page-photo-keywords').val();
        if (!k) {
            tip.show("Please input photo name to search.");
            return;
        }
        goPage("#search-photo?galleryId=" + galleryId + "&keywords=" + k);
    });

    apiRequest.get("/api/photo/search?galleryId=" + galleryId + "&keywords=" + keywords, function (data) {
        var photos = data.data;
        $('#search-photo-counter').html(photos.length + " photos");
        if (photos.length) {
            $('#search-photo-list').html(htmlRender.photoListGalleryIdAndPhotos(galleryId, photos));
        } else {
            $('#search-photo-list').html("<p class='col-12 text-center'>No results with keywords \"<b>" + keywords + "</b></p>");
        }
    }, function (msg) {
        $('#search-photo-list').html("<p>" + msg + "</p>");
    });

    console.log("searchPhotoPageFunction", keywords);
};

//photo detail page
var photoDetailPageFunction = function (p) {
    var galleryId = p["galleryId"];
    var photoId = p["photoId"];
    if (galleryId && photoId) {
        var query = "galleryId=" + encodeURIComponent(galleryId) + "&photoId=" + encodeURIComponent(photoId);
        var url = "/api/photo/detail?" + query;
        apiRequest.get(url, function (data) {
            var photo = data.data;
            $('#photo-detail-time').html(formatTime(photo.time));
            $('#photo-detail-image').attr("src", photo.url);
            $('#photo-detail-filename').html(photo.name);
            if (!window.user.userName) {
                $('#photo-detail-buttons').remove();
            } else {
                $('#photo-detail-buttons .btn').each(function (i, e) {
                    $(e).data('gallery-id', galleryId);
                    $(e).data('photo-id', photo.id);
                    $(e).data('photo-name', photo.name);
                });
            }
        }, function (msg) {
            tip.show(msg);
            setTimeout(function () {
                tip.hide();
                history.back();
            }, 1500);
        });

        var tagUrl = "/api/photo/tag?" + query;
        var photoTags = $('#photo-tags');
        apiRequest.get(tagUrl, function (data) {
            if (data.data.length) {
                var html = [];
                $(data.data).each(function (i, e) {
                    html.push('<span class="badge badge-primary">' + e + '</span>');
                });
                photoTags.html(html.join(' '));
            } else {
                photoTags.html("None");
            }
        }, function (msg) {
            photoTags.html("None");
        });
    }
};

//Implementing with location.hash
var oldHash = "",
    goPage = function (page) {
        if (page == "" || page.split('?')[0] == "#") {
            page = "#gallery";
        }
        if (location.hash == page) {
            page = page.replace(/[\?|&]s=(\d+)/ig, '');
            if (page.indexOf('?') != -1) {
                page = page + "&s=" + +new Date();
            } else {
                page = page + "?s=" + +new Date();
            }
        }
        location.hash = page;
    },
    singlePageSetup = {
        gallery: galleryPageFunction,
        detail: galleryDetailPageFunction,
        "search-gallery": searchGalleryPageFunction,
        "search-photo": searchPhotoPageFunction,
        "detail-photo": photoDetailPageFunction
    };

$(document).ready(function () {
    bindOnceTimeEvents();
    checkUserLogin();
    if (!localStorage.getItem("first-time")) {
        goPage('#gallery');
        localStorage.setItem("first-time", true);
    } else {
        goPage(location.hash);
    }
});
