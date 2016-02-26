// Local Variables
var app               = $( this );
var chatIcon          = $( '.chat-icon' );
var chat              = $( '.chat' );
var channelPrototype  = $( '.channel.wz-prototype' );
var channelList       = $( '.channel-list' );
var chatButton        = $( '.chat-tab-selector' );
var contactsButton    = $( '.contact-tab-selector' );

// DOM Events
app.key('space',function(){
 $( '.ui-window' ).toggleClass( 'dark' );
});

chatButton.on('click', function(){
  contactsButton.removeClass('active');
  chatButton.addClass('active');
});

contactsButton.on('click', function(){
  chatButton.removeClass('active');
  contactsButton.addClass('active');
});

var setTexts = function(){
  $( '.chat-tab-selector span' ).text(lang.chats);
  $( '.contact-tab-selector span' ).text(lang.contacts);
  $( '.conversation-input input' ).attr('placeholder', lang.msg);
  $( '.close-coversation' ).text(lang.close);
  $( '.conversation-send' ).text(lang.send);
  $( '.new-group-button span' ).text(lang.newGroup);
}

var getChannels = function(){

    wz.user.friendList( false, function( error, list ){

      console.log('Channels:', list);

      list.forEach(function(c){

        var channel = channelPrototype.clone();

        console.log('imagen: ', c.avatar.big);

        channel
            .removeClass( 'wz-prototype' )
            .addClass( 'channelDom' )
            .find( '.channel-name' ).text( c.name );
        channel
            .find( '.channel-img' ).css( 'background-image' , 'url(' + c.avatar.big + ')' );
        channel
            .on( 'click' , function(){
              $( '.channelDom.active' ).removeClass( 'active' );
              $( this ).addClass( 'active' );
            });

        channelList.append( channel );

      });

    });

};

var initChat = function(){
  app.css({'border-radius'    : '6px',
           'background-color' : '#2c3238'
  });
  setTexts();
  getChannels();
}

// INIT Chat
initChat();
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
