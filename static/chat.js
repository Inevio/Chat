// Local Variables
var app               = $( this );
var chatIcon          = $( '.chat-icon' );
var chat              = $( '.chat' );
var contactPrototype  = $( '.contact.wz-prototype' );
var contactList       = $( '.contact-list' );
var chatTab           = $( '.chat-tab' );
var chatButton        = $( '.chat-tab-selector' );
var contactTab       = $( '.contact-tab' );
var contactsButton    = $( '.contact-tab-selector' );

// DOM Events
app.key('space',function(){
 $( '.ui-window' ).toggleClass( 'dark' );
});

chatButton.on('click', function(){
  changeTab('chat');
});

contactsButton.on('click', function(){
  changeTab('contact');
});

var setTexts = function(){
  $( '.chat-tab-selector span' ).text(lang.chats);
  $( '.contact-tab-selector span' ).text(lang.contacts);
  $( '.conversation-input input' ).attr('placeholder', lang.msg);
  $( '.close-coversation' ).text(lang.close);
  $( '.conversation-send' ).text(lang.send);
  $( '.new-group-button span' ).text(lang.newGroup);
}

var checkTab = function(){

  //Load channels
  if ( chatButton.hasClass( 'active' ) ) {
    changeTab( 'chat' );

  //Load contacts
  }else{
    changeTab( 'contact' );
  }

}

var changeTab = function(tab){

  switch(tab) {

    case 'chat':

      //Make it active and visible
      contactsButton.removeClass('active');
      chatButton.addClass('active');
      contactTab.removeClass( 'visible' );
      chatTab.addClass( 'visible' );

      break;

    case 'contact':

      //Make it active and visible
      chatButton.removeClass( 'active' );
      contactsButton.addClass( 'active' );
      chatTab.removeClass( 'visible' );
      contactTab.addClass( 'visible' );

      //Insert contacts in DOM
      $( '.contactDom' ).remove();
      getContacts();

      break;

  }

}

var getContacts = function(){

    wz.user.friendList( false, function( error, list ){

      console.log('Contacts:', list);

      list.forEach(function(c){

        var contact = contactPrototype.clone();

        contact
            .removeClass( 'wz-prototype' )
            .addClass( 'contactDom' )
            .find( '.contact-name' ).text( c.name );
        contact
            .find( '.contact-img' ).css( 'background-image' , 'url(' + c.avatar.big + ')' );
        contact
            .on( 'click' , function(){
              selectContact( $( this ) );
            });

        contactList.append( contact );

      });

    });

}

var selectContact = function( contact ){

  //Get contact channel
  var channel = contact.data( 'channel' );

  //Make active
  $( '.contactDom.active' ).removeClass( 'active' );
  contact.addClass( 'active' );

  //No channel
  if( channel == undefined){

  wz.channel( function( error, channel ){

    console.log(error, channel);

    wql.addChannel( channel.id , "simple" , function( error , message ){

      console.log( error , message );
      console.log(channel.getStatus());
      contact.data( 'channel' , channel )

    });

  });

  //Channel
  }else{

  }
}

var initChat = function(){

  app.css({'border-radius'    : '6px',
           'background-color' : '#2c3238'
  });

  setTexts();
  getContacts();
  checkTab();

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
