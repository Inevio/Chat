// Local Variables
var app        = $( this );
var chatIcon   = $( '.chat-icon' );
var chat       = $( '.chat' );

// DOM Events
chatIcon.on( 'click' , function(){
  chat.toggleClass('visible');
  chatIcon.toggleClass('open');
});

// INIT Chat
app.css('border-radius', '6px');

/*

    var userList   = $( '.list' );
    var chatSelf   = $( '.weechat-self', userList );
    var friendZone = $( '.weechat-friends', userList );
    var friend     = $( '.weechat-friends-card.wz-prototype', friendZone );
    var status     = chatSelf.children('i').attr('class');

    // Local Functions
    var addFriend = function( user, connected ){

        var friendCard = friendZone.find('.weechat-friend-' + user.id + '-card');
        var status     = connected ? 'online' : 'offline';

        if( !friendCard.length ){

            friendCard = friend.clone();

            friendCard
                .removeClass('wz-prototype')
                .addClass('weechat-friend-' + user.id + '-card')
                .addClass( status )
                .data( 'user', user )
                .find('span')
                    .text( user.fullName );

            friendCard.find( '.user-avatar' ).attr( 'src', user.avatar.tiny );

        }

        $( '.empty-list', friendZone ).remove();

        var list = friendZone.find( '.weechat-friends-card.' + status );

        if( list.length ){

            var inserted = false;

            list.each( function(){

                if( user.fullName.localeCompare( $(this).find('span').text() ) === -1 ){

                    inserted = true;

                    $(this).before( friendCard );

                    return false;

                }

            });

            if( !inserted ){
                list.last().after( friendCard );
            }

        }else if( connected ){
            friendZone.prepend( friendCard );
        }else{
            friendZone.append( friendCard );
        }

        // Actualizamos el estado al final para no contaminar la lista
        friendCard
            .data( 'status', status )
            .removeClass('online offline')
            .addClass( status )
            .find('i')
                .removeClass('online offline')
                .addClass( status );

    };

    var calculateListHeight = function(){
        friendZone.css( 'max-height', wz.tool.environmentHeight() - ( 2 * parseInt( userList.css('bottom'), 10 ) ) - chatSelf.outerHeight() );
    };

    var connectedFriends = function(){

        wz.user.connectedFriends( false, function( error, list ){

            for( var i = 0; i < list.length; i++ ){
                addFriend( list[ i ], true );
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

        wz.user.friendList( false, function( error, list ){

            var friendCard = null;

            // To Do -> Error
            if( list.length === 0 ){

                friendCard = friend.clone();

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

                // Los ordenamos por orden inverso alfabético, hace mucho más eficiente el ordenado de addFriend()
                // Si está ordenado alfabéticamente se recorre el bucle ( n * n ) / 2 aproximadamente
                // Si está ordenado alfabéticamente a la inversa se recorre el bucle n aproximadamente
                list = list.sort( function( a, b ){
                    return a.fullName.localeCompare( b.fullName );
                }).reverse();

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

        wz.user.friendList( false, function( error, list ){

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
        addFriend( user, true );
    })

    .on( 'disconnect', function( user ){
        addFriend( user, false );
    })

    .on( 'friendAdded', function( user ){
        addFriend( user, false );
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


    */
