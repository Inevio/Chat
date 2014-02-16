
    // Local Variables
    var widget     = $( this );
    var userList   = $( '.list' );
    var chatIcon   = $( '.weechat-icon' );
    var chatSelf   = $( '.weechat-self', userList );
    var friendZone = $( '.weechat-friends', userList );
    var friend     = $( '.weechat-friends-card.wz-prototype', friendZone );
    var status     = chatSelf.children('i').attr('class');
    
    // Local Functions
    var addFriend = function( user ){

        var friendCard = friend.clone();
        
        friendCard
            .removeClass( 'wz-prototype' )
            .data( 'user', user )
            .data( 'status', 'offline' )
            .addClass( 'weechat-friend-' + user.id + '-card' )
            .children( 'span' )
                .text( user.fullName );

        friendCard.find( '.user-avatar' ).attr( 'src', user.avatar.tiny );
        
        friendZone.append( friendCard );

        $( '.empty-list', friendZone ).remove();

    };

    var calculateListHeight = function(){
        friendZone.css( 'max-height', wz.tool.environmentHeight() - ( 2 * parseInt( userList.css('bottom'), 10 ) ) - chatSelf.outerHeight() );
    };

    var changeFriendStatus = function( id, status ){

        $( '.weechat-friend-' + id + '-card i', friendZone )
            .removeClass()
            .addClass( 'status ' + status )
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
            
        var conv = wz.app.getWidgets().filter( '.weechat-user-' + user.id );

        if( !conv.size() ){
            wz.app.createWidget( [ user, status, message ], 'conversation' );
            //wz.desktop.focusDeskitem( wz.app( 14 ).createWidget( [ user, status, message ], 'conversation' ) );
        }else{

            if( conv.hasClass('hidden') ){
                conv.find('.weechat-friends-card').click();
            }

            wz.app.widgetToFront( conv );

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
                
                if( list.length * friend.outerHeight( true ) > ( wz.tool.desktopHeight() * 0.8 - $( '.weechat-self', userList ).outerHeight( true ) ) ){
                    friendZone.height( wz.tool.desktopHeight() * 0.8 - $( '.weechat-self', userList ).outerHeight( true ) );
                }
                
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
                    .addClass( 'empty-list' )
                    .children( 'span' )
                        .text( lang.emptyList )
                    .siblings()
                        .remove();
                
                friendZone.append( friendCard );
                
                friendCard.siblings().not( '.wz-prototype' ).remove();

            }
            
        });

    };

    // WZ Events
    wz.channel
    .on( 'message', function( info, data ){

        var conv = wz.app.getWidgets().filter( '.weechat-user-' + info.sender );

        if( conv.size() ){
            return false;
        }

        var card = $( '.weechat-friend-' + info.sender + '-card', widget );

        if( card.size() ){
            createConversation( card.data('user'), card.data('status'), data );
        }

    });

    wz.system
    .on( 'resize', function(){
        calculateListHeight();
    });

    wz.user
    .on( 'connect', function( user ){
        changeFriendStatus( user.id, 'online' );
    })

    .on( 'disconnect', function( user ){
        changeFriendStatus( user.id, 'offline' );
    })

    .on( 'friendAdded', function( user ){
        addFriend( user );
    })

    .on( 'friendRemoved', function( user ){
        removeFriend( user );
    });

    // DOM Events
    widget

    .on( 'ui-view-blur', function(){

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
    calculateListHeight();
    setTimeout( connectedFriends, 500 ); // To Do -> Se puede hacer mejor en una promesa
    $( '.weechat-self .user-avatar', widget ).attr( 'src', wz.system.user().avatar.tiny );
    $( '.weechat-self .user-name', widget ).text( wz.system.user().fullName );

    $( '.self-status', widget ).text( lang.statusOnline );
    $( '.status-online', widget ).text( lang.statusOnline );
    $( '.status-busy', widget ).text( lang.statusBusy );
    $( '.status-away', widget ).text( lang.statusAway );
    $( '.status-disconnect', widget ).text( lang.statusDisconnect );
