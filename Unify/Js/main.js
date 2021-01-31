//Global Variables
var song = new Audio();
var queue = [];
var currentSong = 0;
var lastsong;
var valid_input = false;
var errno;
var username = $.trim($('.user_settings_username').text());

$(".user_and_settings").click(function() {
    $(".user_settings_wrapp").toggle();
})

//Document Ready
$(document).ready(function() {
    fill_side_playlists();
    show_user_songs();
});

//Document Listeners
$(document).click(function(e) {
    // console.log(e);
    if (!$(e.target).is(".queue_icon")) {
        $(".queue_list").removeClass("show_flex")
        $(".queue_list").empty();
    }
    if (!$(e.target).is(".song_opt_dots")) {
        $(".song_opt_main").hide();
    }
});


//LISTENERS
$(".explore_btn").click(show_explore);

$(".songs_btn").click(show_user_songs);

$(".artists_btn").click(show_user_artists);

$(".albums_btn").click(show_user_albums);

$(".queue_icon").click(show_queued_songs);

$('.create_playlist_submit').click(create_new_playlist);

$(".playback_play_btn").click(play_pause);

$(".volume_slider").change(change_volume);

$(".playback_next_btn").click(play_next);

$(".recently_btn").click(show_user_recent);

$(".create_playlist_wrapp").click(function(e) {
    if ($(e.target).is(".create_playlist_wrapp"))
        $(this).fadeOut();
});

$('.create_playlist_input').keyup(function() {
    check_valid_pl_name()
        .done(function(data) {
            if (data == "OK") {
                $('.error_input_wrapp').removeClass('visible');
                $('.create_playlist_input').removeClass("wrong_input");
            } else {
                $('.create_playlist_input').addClass("wrong_input");
                $('.error_input_wrapp').addClass('visible');
            }
        })
});

//LISTENER FUNCTIONS
function show_explore() {
    $('.content').empty();
    $loaded = $('<div>', { 'class': 'loaded explore_layout' }).appendTo('.content');
    //BUILDING ALBUMS EXPLORE SECTION
    $explore_album_wrapp = $('<div>', { 'class': 'explore_albums' }).appendTo($loaded);
    $explore_album_head = $('<div>', {
        'class': 'explore_section_head',
        'prepend': $('<p>', {
            'class': 'expolore_title',
            'html': 'Albums'
        }),
        'append': $('<p>', {
            'class': 'explore_section_see_more',
            'html': 'See More'
        })
    }).appendTo($explore_album_wrapp);
    $wrapper = $('<div>', { 'class': 'explore_albums_albums' }).appendTo($explore_album_wrapp);
    $.when($.getJSON("./php/ajax_requests.php", "username=" + username + "&type=explore_album",
        function(json, textStatus, jqXHR) {
            json.albums.forEach(function(item) {
                var $single_album = $('<div>', {
                    'class': 'explore_albums_item',
                    'prepend': $('<div>', {
                        'class': 'explore_albums_ill',
                        'html': $('<div>', {
                            'class': 'explore_albums_ill_hover',
                            'html': $('<div>', {
                                'class': 'explore_albums_ill_buttons',
                                'html': $('<div>', {
                                    'class': 'explore_ill_play_bttn',
                                }).click(function(e) {
                                    e.stopPropagation();
                                }),
                                'append': $('<div>', {
                                    'class': 'explore_ill_add_bttn',
                                }).click(function(e) {
                                    e.stopPropagation();
                                }),
                            })
                        }).click(show_album)
                    }).css({ "background": "url(\"./unify_media/" + item.artist + "/" + item.album + "/cover.jpg\") center/cover" }),
                    'append': $('<div>', {
                        'class': 'album_det',
                        'html': $('<p>', {
                            'class': 'album_det_name',
                            'html': item.album
                        }),
                        'append': $('<p>', {
                            'class': 'album_det_artist_name',
                            'html': item.artist
                        })
                    })
                }).appendTo($wrapper);
            });
        }
    )).then(function() {
        //BUILDING SONGS EXPLORE SECTION
        $explore_songs_wrapp = $('<div>', { 'class': 'explore_songs' }).appendTo($loaded);
        $explore_songs_head = $('<div>', {
            'class': 'explore_section_head',
            'prepend': $('<p>', {
                'class': 'expolore_title',
                'html': 'Songs'
            }),
            'append': $('<p>', {
                'class': 'explore_section_see_more',
                'html': 'See More'
            })
        }).appendTo($explore_songs_wrapp);
        $wrapper = $('<div>', { 'class': 'explore_songs_songs' }).appendTo($explore_songs_wrapp);
        $.when($.getJSON("./php/ajax_requests.php", "username=" + username + "&type=explore_songs",
            function(json, textStatus, jqXHR) {
                json.songs.forEach(function(item) {
                    var $single_song = $('<div>', { 'class': 'row_song_songname' }).appendTo($wrapper);
                    $ill = $('<div>', {
                        'class': 'song_illustration',
                        'prepend': $('<div>', {
                            'class': 'song_illustration',
                        }).click(function() {
                            play_this(item.name, item.artist, item.album);
                        }).css({ "background": "url(\"./unify_media/" + item.artist + "/" + item.album + "/cover.jpg\") center/cover" })
                    }).appendTo($single_song)
                    $songname = $('<div>', {
                        'class': 'songname',
                        'html': item.name,
                    }).appendTo($single_song)
                    song_already_owned(item.name).done(function(response) {
                        if (response != "OK") {
                            $song_add_icon = $('<div>', {
                                'class': 'song_owned_icon'
                            }).appendTo($single_song);
                        } else {
                            $song_add_icon = $('<div>', {
                                'class': 'song_add_icon',
                            }).click(function() {
                                add_song_to_library(item.name, this);
                            }).appendTo($single_song);
                        }
                    })
                });
            }
        )).then(function() {

        })
    })
}

function show_user_songs() {
    $(".content").empty();
    $library_header = $('<div>', { 'class': 'library_header' });
    $('<div>', { 'class': 'column_header_name', 'html': 'Name' }).appendTo($library_header);
    $('<div>', { 'class': 'column_header_artist', 'html': 'Artist' }).appendTo($library_header);
    $('<div>', { 'class': 'column_header_album', 'html': 'Album' }).appendTo($library_header);
    $('<div>', { 'class': 'column_header_time', 'html': 'Lenght' }).appendTo($library_header);
    $.getJSON("./php/ajax_requests.php", "type=user_songs&username=" + username, function(json) {
        if (json.songs.length > 0) {
            $library_header.appendTo(".content");
            $('<div>', { 'class': 'loaded' }).addClass("songs_layout").appendTo(".content");
            json.songs.forEach(function(item) {
                var $single_row_song = $('<div>', { 'class': 'row_song' }).appendTo(".loaded");;
                var $songname = $('<div>', {
                    'class': 'row_song_songname',
                    'prepend': $('<div>', {
                        'class': 'song_illustration',
                    }).click(function() {
                        play_this(item.name, item.artist, item.album);
                    }).css({ "background": "url(\"./unify_media/" + item.artist + "/" + item.album + "/cover.jpg\") center/cover" }),
                    'append': $('<div>', {
                        'class': 'songname',
                        'html': item.name,
                    })
                }).appendTo($single_row_song);
                $song_dots = $('<div>', {
                    'class': 'song_opt_dots',
                    'html': $('<div>', {
                        'class': 'song_opt_main',
                        'html': $('<div>', {
                            'class': 'song_opt_item add_queue_item',
                            'html': 'Add to queue',
                            'append': $('<div>', {
                                'class': 'song_opt_item_icon add_queue_icon',
                            })
                        }).click(add_song_queue),
                        'append': $('<div>', {
                            'class': 'song_opt_item add_playlist_item',
                            'html': 'Add to playlist',
                            'append': $('<div>', {
                                'class': 'song_opt_playlist_main'
                            })
                        }).hover(show_playlist_menu)
                    })
                }).click(opt_menu).appendTo($songname);
                $('<div>', { 'class': 'row_song_songartist', 'html': item.artist }).appendTo($single_row_song);
                $('<div>', { 'class': 'row_song_songalbum', 'html': item.album }).appendTo($single_row_song);
                $('<div>', { 'class': 'row_song_songtime', 'html': item.length }).appendTo($single_row_song);
            });
        } else {
            show_empty_section();
        }
    });
}

function show_empty_section() {
    var $wrapper = $('<div>', { 'class': 'loaded empty_section' }).appendTo(".content");
    $wrapper.append($('<div>', {
        'class': 'empty_section_message',
        'html': $('<div>', {
            'class': 'empty_section_text',
            'html': 'There is no songs in your library, explore to add songs'
        }),
        'append': $('<div>', {
            'class': 'empty_section_explore_btn',
            'html': 'Explore'
        }).click(show_explore),
    }))
}

function show_user_artists() {
    $(".content").empty();
    $.getJSON("./php/ajax_requests.php", "type=user_artists&username=" + username,
        function(json) {
            if (json.artists.length > 0) {
                var $wrapper = $('<div>', { 'class': 'loaded artists_layout' }).appendTo(".content");
                var $side = $('<div>', { 'class': 'artists_side' }).appendTo($wrapper);
                var $artist_content = $('<div>', { 'class': 'artist_content' }).appendTo($wrapper);
                json.artists.forEach(function(item) {
                    $single_art_row = $('<div>', {
                        'class': 'artist_row',
                        'prepend': $('<div>', {
                            'class': 'artist_icon',
                        }).css({ "background": "url(\"./unify_media/" + item.name + "/artist.jpg\") center/cover" }),
                        'append': $('<div>', {
                            'class': 'artist_artist_name',
                            'html': item.name
                        }),
                    }).appendTo($side).click(show_this_artist);
                });
            } else {
                show_empty_section();
            }
        }
    );
}

function show_user_albums() {
    $(".content").empty();
    $.getJSON("./php/ajax_requests.php", "type=user_albums&username=" + username, function(json) {
        if (json.albums.length > 0) {
            $wrapper = $('<div>', { 'class': 'loaded album_layout' }).appendTo(".content");
            json.albums.forEach(function(item) {
                var $single_album_window = $('<div>', {
                    'class': 'album',
                    'prepend': $('<div>', {
                        'class': 'album_ill',
                        'html': $('<div>', {
                            'class': 'ill_hover',
                            'html': $('<div>', {
                                'class': 'ill_buttons',
                                'html': $('<div>', {
                                    'class': 'ill_play_bttn',
                                }).click(function(e) {
                                    e.stopPropagation();
                                    play_album($(this).parents(".album_ill").next().children(".album_det_name").text(),
                                        $(this).parents(".album_ill").next().children(".album_det_artist_name").text());
                                })
                            })
                        }).click(show_album)
                    }).css({ "background": "url(\"./unify_media/" + item.artist + "/" + item.album + "/cover.jpg\") center/cover" }),
                    'append': $('<div>', {
                        'class': 'album_det',
                        'html': $('<p>', {
                            'class': 'album_det_name',
                            'html': item.album
                        }),
                        'append': $('<p>', {
                            'class': 'album_det_artist_name',
                            'html': item.artist
                        })
                    })
                }).appendTo($wrapper);
            });
        } else {
            show_empty_section();
        }
    });
    $wrapper.appendTo(".loaded");
}

function show_queued_songs() {
    $list = $(".queue_list").empty().toggleClass("show_flex");
    if (queue.length > 0) {
        $list.removeClass('no_queued_items');
        for ($i = 0; $i < queue.length; $i++) {
            $list.append($('<div>', {
                'class': 'queue_item',
                'html': $('<div>', {
                    'class': 'queue_item_ill',
                }).css({ "background": "url(\"./unify_media/" + queue[$i].artist + "/" + queue[$i].album + "/cover.jpg\") center/cover" }),
                'append': $('<div>', {
                    'class': 'queue_item_name',
                    'html': queue[$i].name + " -- " + queue[$i].artist
                })
            }))
        }
        $list.append($('<div>', {
            'class': 'queue_reset_btn',
            'html': 'Reset Queue'
        }).click(reset_queue));
    } else {
        $list.addClass('no_queued_items');
        $list.append($('<div>', {
            'html': "There are no songs in the queue."
        }));
    }
}

function create_new_playlist() {
    check_valid_pl_name()
        .done(function(data) {
            if (data == "OK") {
                $('.error_input_wrapp').removeClass('visible');
                $('.create_playlist_input').removeClass("wrong_input");
                $.get("./php/ajax_requests.php", "username=" + username + "&type=insert_new_pl&pl_name=" + $('#pl_input').val(),
                    function(data) {
                        if (data === "ok") {
                            $('.create_playlist_wrapp').fadeOut();
                            fill_side_playlists();
                            setTimeout(function() {
                                playlist_check();
                            }, 1000);
                        } else {
                            $('.create_playlist_input').addClass("wrong_input");
                            $('.error_input_wrapp').addClass('visible');
                        }
                    }
                );
            } else {
                $('.create_playlist_input').addClass("wrong_input");
                $('.error_input_wrapp').addClass('visible');
            }
        })
}

function reset_queue() {
    $(".queue_list").addClass("no_queued_items");
    queue = [];
    currentSong = 0;
}

function opt_menu() {
    $(this).children(1).show();
};

function add_song_queue() {
    $songname = $(this).parents(".row_song_songname").children(".songname").text();
    $songartist = $(this).parents(".row_song_songname").nextAll(".row_song_songartist").text();
    $songalbum = $(this).parents(".row_song_songname").nextAll(".row_song_songalbum").text();
    queue.push({
        'name': $songname,
        'artist': $songartist,
        'album': $songalbum
    });
    currentSong++;
};

function show_album() {
    $('.content').empty();
    $alb_name = $(this).parents('.album').children('.album_det').children(".album_det_name").text();
    $art_name = $(this).parents('.album').children('.album_det').children(".album_det_artist_name").text();
    $loaded = $('<div>', { 'class': 'loaded single_album_layout' });
    $('<div>', {
        'class': 'single_album_ill_wrapp',
        'html': $('<div>', {
            'class': 'single_album_ill'
        }).css({ "background": "url(\"./unify_media/" + $art_name + "/" + $alb_name + "/cover.jpg\") center/cover" })
    }).appendTo($loaded);
    $w1 = $('<div>', {
        'class': 'single_album_det_wrapp',
        'html': $('<div>', {
            'class': 'single_album_det',
            'html': $('<div>', {
                'class': 'single_album_artist',
                'html': $art_name
            }),
            'prepend': $('<div>', {
                'class': 'single_album_name',
                'html': $alb_name
            }),
            'append': $('<div>', {
                'class': 'single_album_genre',
                'html': "pop"
            })
        })
    }).appendTo($loaded);
    $('<div>', { 'class': 'single_album_play_btn', 'html': 'Play' })
        .click(function() {
            play_album($('.single_album_name').text(), $('.single_album_artist').text());
        })
        .appendTo($w1.children(".single_album_det"));
    var $wrapper = $('<div>', { 'class': 'single_album_songs songs_layout' });
    $.getJSON("./php/ajax_requests.php", "username=" + username + "&type=album_songs&album=" + $alb_name,
        function(json, textStatus, jqXHR) {
            $i = 1;
            json.songs.forEach(function(item) {
                var $single_row_song = $('<div>', {
                    'class': 'album_row_song',
                    'html': $('<div>', {
                        'class': 'row_song_songname',
                        'html': item.name
                    }),
                    'prepend': $('<div>', {
                        'class': 'row_song_songnumber',
                        'html': $i
                    }).click(function() {
                        play_this(item.name, $art_name, $alb_name);
                    }),
                    'append': $('<div>', {
                        'class': 'row_song_songtime',
                        'html': item.length
                    }),
                });
                $single_row_song.appendTo($wrapper);
                $i++;
            });
        }
    );
    $wrapper.appendTo($w1);
    $loaded.appendTo(".content");
}

function play_album($songalbum, $songartist) {
    play_pause();
    reset_queue();
    $.getJSON("./php/ajax_requests.php", "username=" + username + "&type=album_songs&album=" + $songalbum,
        function(json, textStatus, jqXHR) {
            json.songs.forEach(function(item) {
                queue.push({
                    'name': item.name,
                    'artist': $songartist,
                    'album': $songalbum
                });
            });
            play_next();
        }
    );
}


function show_this_artist() {
    $('.artist_content').empty();
    $art_name = $(this).children('.artist_artist_name').text();
    $alb_name = "";
    $.getJSON("./php/ajax_requests.php", "username=" + username + "&artist=" + $art_name + "&type=album_artist_per_user",
        function(json, textStatus, jqXHR) {
            json.albums.forEach(function(item) {
                $alb_name = item.albumname
                $album = $('<div>', {
                    'class': 'artist_album_row',
                    'prepend': $('<div>', {
                        'class': 'artist_album_ill'
                    }).css({ "background": "url(\"./unify_media/" + $art_name + "/" + item.albumname + "/cover.jpg\") center/cover" })
                });
                $album_det = $('<div>', { 'class': 'artist_album_det' }).appendTo($album);
                $('<div>', {
                    'class': 'single_album_det',
                    'html': $('<div>', {
                        'class': 'single_album_genre',
                        'html': item.genre
                    }),
                    'prepend': $('<div>', {
                        'class': 'single_album_name',
                        'html': $alb_name
                    }),
                    'append': $('<div>', {
                        'class': 'single_album_play_btn',
                        'html': "Play"
                    }).click(function() {
                        play_album($alb_name, $art_name);
                    })
                }).appendTo($album_det);
                $songs = $('<div>', { 'class': 'single_album_songs songs_layout' }).appendTo($album_det);
                $i = 1;
                item.songs.forEach(function(songs) {
                    var $single_row_song = $('<div>', {
                        'class': 'album_row_song',
                        'html': $('<div>', {
                            'class': 'row_song_songname',
                            'html': songs.songname
                        }),
                        'prepend': $('<div>', {
                            'class': 'row_song_songnumber',
                            'html': $i
                        }).click(function() {
                            play_this(songs.songname, $art_name, $alb_name);
                        }),
                        'append': $('<div>', {
                            'class': 'row_song_songtime',
                            'html': item.length
                        }),
                    });
                    $single_row_song.appendTo($songs);
                    $i++;
                });
                $album.appendTo('.artist_content');
            });
        });
}

function show_user_recent() {
    $(".content").empty();
}

function song_already_owned($songname) {
    return $.get("./php/ajax_requests.php",
        "username=" + username + "&songname=" + $songname + "&type=check_owned_song");
}

function fill_side_playlists() {
    $wrapper = $('.playlists_list').empty();
    $.getJSON("./php/ajax_requests.php", "type=user_playlists&username=" + username,
        function(json) {
            json.playlists.forEach(function(item) {
                $('<div>', {
                    'class': 'section_item playlist_item',
                    'prepend': $('<span>', {
                        'class': 'section_icon playlist_icon',
                    }),
                    'append': $('<div>', {
                        'class': 'playlist_item_name',
                        'html': item.name
                    }).click(show_this_pl)
                }).appendTo($wrapper);
            });
        }
    );
};

function show_playlist_menu() {
    $song_selected = $(this).parents(".row_song_songname ").children(".songname").text();
    $list = $(this).children(1);
    $list.empty().append($('<div>', {
        'class': 'song_opt_item new_pl',
        'html': 'Create New',
        'append': $('<div>', {
            'class': 'song_opt_playlist_create_icon'
        })
    }).click(create_playlist));
    $.getJSON("./php/ajax_requests.php", "type=user_playlists&username=" + username, function(json) {
        json.playlists.forEach(function(item) {
            $list.append($('<div>', {
                'class': 'song_opt_item alrd_ex_pls',
                'html': item.name
            }).click(function() {
                add_to_playlist($song_selected, item.name);
            }));
        });
    });
};

function playlist_check() {
    $(".add_playlist_check_wrapp").addClass("playlist_add_checked");
    setTimeout(function() {
        $(".add_playlist_check_wrapp").removeClass("playlist_add_checked");
    }, 2000);
};

function add_to_playlist($songname, $pl_name) {
    $.get("./php/ajax_requests.php", "username=" + username + "&type=insert_song_into_pl&pl_name=" + $pl_name +
        "&songname=" + $songname,
        function(data) {
            if (data == "ok") {

            } else {

            }
        },
        "text"
    )
};

function create_playlist() {
    $('.create_playlist_wrapp').fadeIn().css("display", "flex");
};

function check_valid_pl_name() {
    return $.get("./php/ajax_requests.php", "username=" + username + "&type=check_pl_exist&new_pl_name=" + $('#pl_input').val());
}

function show_this_pl() {
    $(".content").empty();
    $pl_content = $('<div>', { 'class': 'playlist_content songs_layout' });
    $('<div>', {
        'class': 'loaded playlist_layout',
        'html': $('<div>', {
            'class': 'playlist_head_wrapp',
            'html': $('<div>', {
                'class': 'playlist_head',
                'html': $('<div>', {
                    'class': 'pl_img no_artwork'
                }),
                'append': $('<div>', {
                    'class': 'pl_infos',
                    'html': $('<div>', {
                        'class': 'pl_name',
                        'html': $(this).text()
                    }),
                    'append': $('<div>', {
                        'class': 'other_pl_infos',
                        'html': $('<div>', {
                            'class': 'n_songs_pl',
                            'html': '22'
                        }),
                        'append': $('<div>', {
                            'class': 'tot_time_pl',
                            'html': '22'
                        })
                    })
                })
            })
        })
    }).appendTo('.content').append($pl_content);
    $pl_name = $(this).text();
    $.getJSON("./php/ajax_requests.php", "username=" + username + "&type=songs_into_pl&pl_name=" + $pl_name,
        function(json, textStatus, jqXHR) {
            json.songs.forEach(function(item) {
                var $single_row_song = $('<div>', { 'class': 'row_song' });
                $('<div>', {
                    'class': 'row_song_songname',
                    'prepend': $('<div>', {
                        'class': 'song_illustration',
                    }).click(function() {
                        play_this(item.name, item.artist, item.album);
                    }).css({ "background": "url(\"./unify_media/" + item.artist + "/" + item.album + "/cover.jpg\") center/cover" }),
                    'append': $('<div>', {
                        'class': 'songname',
                        'html': item.name,
                    })
                }).appendTo($single_row_song);
                $('<div>', { 'class': 'row_song_songartist', 'html': item.artist }).appendTo($single_row_song);
                $('<div>', { 'class': 'row_song_songalbum', 'html': item.album }).appendTo($single_row_song);
                $('<div>', { 'class': 'row_song_songtime', 'html': item.length }).appendTo($single_row_song);
                $single_row_song.appendTo($pl_content);
            });
        }
    );

}

function check_remotely_exist(url) {
    $flag = 0;
    $.ajax({
        async: false,
        type: "HEAD",
        url: url,
        success: function(response) {
            $flag = 1;
        }
    });
    if ($flag == 1) {
        return true;
    } else {
        return false;
    }
}

function add_song_to_library($songname, $div) {
    $($div).removeClass('song_add_icon').addClass('loader');
    setTimeout(() => {
        $.get("./php/ajax_requests.php", "type=add_song_to_lib&username=" + username + "&songname=" + $songname,
            function(data) {
                if (data == "OK") {
                    $($div).removeClass('loader').addClass('song_owned_icon');
                } else {
                    $($div).removeClass('loader').addClass('song_add_icon');
                }
            },
            "text"
        );
    }, 2000);
}

//PLAYBACK HANDLING


function play_this($songname, $songartist, $songalbum) {
    $newsrc = "./unify_media/" + $songartist + "/" + $songalbum + "/" + $songname + ".mp3";
    if (lastsong != $newsrc) {
        if (check_remotely_exist($newsrc)) {
            lastsong = $newsrc;
            song.src = $newsrc;
            song.play();
            $(".actual_song_name").text($songname);
            $(".actual_artist_album").text($songartist + " -- " + $songalbum);
            $(".miniplayer_img").removeClass("no_artwork").css({
                "background": "url('./unify_media/" + $songartist + "/" + $songalbum + "/cover.jpg') center/cover"
            });
            $(".playback_play_btn").addClass("song_played");
        } else {

        }
    } else {
        song.currentTime = 0;
    }
};

function play_pause() {
    if (song.paused) {
        if (!$(".miniplayer_img").hasClass("no_artwork")) {
            song.play();
            $(".playback_play_btn").addClass("song_played");
        } else if (queue.length != 0) {
            play_next();
        }
    } else {
        song.pause();
        $(".playback_play_btn").removeClass("song_played");
    }
}

function play_next() {
    song.pause();
    if (queue.length > 0) {
        song.src = "./unify_media/" + queue[0].artist +
            "/" + queue[0].album + "/" + queue[0].name + ".mp3";
        $(".actual_song_name").text(queue[0].name);
        $(".actual_artist_album").text(queue[0].artist + " -- " + queue[0].album);
        $(".miniplayer_img").removeClass("no_artwork").css({
            "background": "url('./unify_media/" + queue[0].artist +
                "/" + queue[0].album + "/cover.jpg') center/cover"
        });
        queue.shift();
        play_pause();
    } else {

    }
}

function change_volume() {
    song.volume = parseFloat(this.value / 100);
}