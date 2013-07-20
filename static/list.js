
wz.widget.addScript( 14, 'list', function( widget, wid, lang, params ){

    // Local Variables
    var userList   = $('.wz-widget-1.list');
    var chatIcon   = $('.wz-widget-1.weechat-icon');
    var status     = $('.weechat-self', userList).children('i').attr('class');
    var friendZone = userList.children('.weechat-friends');
    var friend     = friendZone.children('.weechat-friends-card.wz-prototype');
    
    // Local Functions
    var addFriend = function( user ){

        friendCard = friend.clone();
        
        friendCard
            .removeClass('wz-prototype')
            .data( 'user', user )
            .data( 'status', 'offline' )
            .addClass('weechat-friend-' + user.id + '-card')
            .children('span')
                .text( user.fullName );

        friendCard.find( 'img' ).attr( 'src', user.avatar.tiny )
        
        friendZone.append( friendCard );

        $( '.empty-list', friendZone ).remove();

    };

    var changeFriendStatus = function( id, status ){

        $( '.weechat-friend-' + id + '-card i', friendZone )
            .removeClass()
            .addClass( status )
            .parent()
                .data( 'status', status );

    };

    var connectedFriends = function(){

        wz.user.connectedFriends( true, function( error, list ){

            for( var i = 0; i < list.length; i++ ){
                changeFriendStatus( list[ i ], 'online' );
            }

        });

    };

    var createConversation = function( user, status, message ){

        var conv = wz.tool.widget( 1 ).filter( '.weechat-user-' + user.id );

        if( !conv.size() ){
            wz.desktop.focusDeskitem( wz.widget.createWidget( 1, [ user, status, message ], 'conversation' ) );
        }else{

            if( conv.hasClass('hidden') ){
                conv.find('.weechat-friends-card').click();
            }

            wz.widget.bringWidgetToFront( conv );
            wz.desktop.focusDeskitem( conv );

        }

    };

    var friends = function(){
        
        wz.user.friendList( function( error, list ){

            var friendCard = null;
            
            // To Do -> Error
            if( list.length === 0 ){
                                    
                friendCard = friend.clone();

                // To Do -> Cambiar CSS por una clase

                friendCard
                    .removeClass()
                    .addClass('empty-list')
                    .children('span')
                        .text( lang.emptyList )
                    .siblings()
                        .remove();
                
                friendZone.append( friendCard );
                
                friendCard.siblings().not('.wz-prototype').remove();

            }else{
                
                for( var i = 0; i < list.length; i++ ){ 
                    addFriend( list[ i ] );
                }
            
            }
            
        });
        
    };

    var removeFriend = function( user ){
        $( '.weechat-friend-' + user.id + '-card', userList ).remove();
        countFriends();
    };

    var countFriends = function(){

        wz.user.friendList( function( error, list ){

            var friendCard = null;
            
            // To Do -> Error
            if( list.length === 0 ){
                                    
                friendCard = friend.clone();

                // To Do -> Cambiar CSS por una clase

                friendCard
                    .removeClass()
                    .addClass('empty-list')
                    .children('span')
                        .text( lang.emptyList )
                    .siblings()
                        .remove();
                
                friendZone.append( friendCard );
                
                friendCard.siblings().not('.wz-prototype').remove();

            }
            
        });

    };

    // Events
    widget

    .on( 'message', function( e, data ){

        var conv = wz.tool.widget( 1 ).filter( '.weechat-user-' + data.user.id );

        if( conv.size() ){
            return false;
        }

        var card = $( '.weechat-friend-' + data.user.id + '-card', widget );

        createConversation( card.data('user'), card.data('status'), data );

    })

    .on( 'user-connect', function( event, user ){
        changeFriendStatus( user.id, 'online' );
    })

    .on( 'user-disconnect', function( event, user ){
        changeFriendStatus( user.id, 'offline' );
    })

    .on( 'user-friendAdded', function( event, user ){
        addFriend( user );
    })

    .on( 'user-friendRemoved', function( event, user ){
        removeFriend( user );
    })    

    .on( 'wz-blur', function(){

        userList.addClass('hidden');
        chatIcon.removeClass('open');
        userList.addClass( 'contextmenu-invisible' );

    });

    userList

    .on( 'click', '.weechat-friends-card', function(){
        createConversation( $( this ).data('user'), $( this ).data('status') );
    })

    .on( 'click', '.weechat-self-clickable, .self-status', function( e ){

        e.stopPropagation();

        if( userList.hasClass( 'contextmenu-invisible' ) ){
            userList.removeClass( 'contextmenu-invisible' );
        }else{
            userList.addClass( 'contextmenu-invisible' );
        }

    })

    .on( 'click', function(){
        userList.addClass( 'contextmenu-invisible' );
    });

    chatIcon

    .on( 'click', function(){

        if( userList.hasClass('hidden') ){

            userList.removeClass('hidden');
            chatIcon.addClass('open');

        }else{

            userList.addClass('hidden');
            chatIcon.removeClass('open');

        }
        
    });

    // Start the widget
    friends();
    setTimeout(connectedFriends,500);
    $( '.weechat-self img', widget ).attr( 'src', wz.info.user().avatar.tiny );

    $( '.self-status', widget ).text( lang.statusOnline );
    $( '.status-online', widget ).text( lang.statusOnline );
    $( '.status-busy', widget ).text( lang.statusBusy );
    $( '.status-away', widget ).text( lang.statusAway );
    $( '.status-disconnect', widget ).text( lang.statusDisconnect );

});
