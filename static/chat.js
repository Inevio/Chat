// Local Variables
var app               = $( this );
var chatIcon          = $( '.chat-icon' );
var chat              = $( '.chat' );
var contactPrototype  = $( '.contact.wz-prototype' );
var chatPrototype     = $( '.channel.wz-prototype' );
var contactList       = $( '.contact-list' );
var channelList       = $( '.channel-list' );
var chatTab           = $( '.chat-tab' );
var chatButton        = $( '.chat-tab-selector' );
var contactTab        = $( '.contact-tab' );
var contactsButton    = $( '.contact-tab-selector' );
var sendButton        = $( '.conversation-send' );
var content           = $( '.ui-content' );
var lastMessage       = $( '.conversation-moreinfo' );
var searchBox         = $( '.chat-search input' );
var closeChatButton   = $( '.close-coversation' );
var newGroupButton    = $( '.new-group-button' );
var groupMenu         = $( '.group-menu' );

// DOM Events
app.key( 'space' , function(){

 $( '.ui-window' ).toggleClass( 'dark' );

});

chatButton.on( 'click' , function(){

  changeTab('chat');

});

contactsButton.on( 'click' , function(){

  changeTab('contact');

});

sendButton.on( 'click' , function(){

  sendMessage();

});

app.key( 'enter' ,function(){

  sendMessage();

});

searchBox.on( 'input' , function(){

  filterElements( $( this ).val() );

});

wz.channel.on( 'message' , function( message , text ){

  messageRecived( message , text );

});

closeChatButton.on( 'click' , function(){

  content.removeClass( 'visible' );

  if ( chatButton.hasClass( 'active' ) ) {

    $( '.chatDom.active' ).removeClass( 'active' );

  }else{

    $( '.contactDom.active' ).removeClass( 'active' );

  }

});

newGroupButton.on( 'click' , function(){

  groupMenu.addClass( 'visible' );

});

// FUNCTIONS
var setTexts = function(){
  $( '.chat-tab-selector span' ).text(lang.chats);
  $( '.contact-tab-selector span' ).text(lang.contacts);
  $( '.conversation-input input' ).attr('placeholder', lang.msg);
  $( '.close-coversation' ).text(lang.close);
  $( '.conversation-send' ).text(lang.send);
  $( '.new-group-button span' ).text(lang.newGroup);
  $( '.no-chat-txt' ).text(lang.noChat);
  $( '.group-menu .back span' ).text(lang.back);
  $( '.group-menu .edit' ).text(lang.edit);
  $( '.group-info .title' ).text(lang.info);
  $( '.group-members .title' ).text(lang.members);
  $( '.remove-group span' ).text(lang.deleteExit);
}

var checkTab = function(){

  // Load channels
  if ( chatButton.hasClass( 'active' ) ) {
    changeTab( 'chat' );

  // Load contacts
  }else{
    changeTab( 'contact' );
  }

}

var changeTab = function(tab){

  switch(tab) {

    case 'chat':

      // Make it active and visible
      contactsButton.removeClass('active');
      chatButton.addClass('active');
      contactTab.removeClass( 'visible' );
      chatTab.addClass( 'visible' );
      newGroupButton.removeClass( 'visible' );

      // Insert chats in DOM
      $( '.chatDom' ).remove();
      getChats();

      break;

    case 'contact':

      // Make it active and visible
      chatButton.removeClass( 'active' );
      contactsButton.addClass( 'active' );
      chatTab.removeClass( 'visible' );
      contactTab.addClass( 'visible' );
      newGroupButton.addClass( 'visible' );

      // Insert contacts in DOM
      $( '.contactDom' ).remove();
      getContacts();

      break;

  }

}

var getContacts = function(){

    wz.user.friendList( false, function( error, list ){

      if ( error ) { console.log('ERROR: ', error ); }

        console.log( 'metiendo contactos' , list );

        $.each( list , function( i , c ){

          wql.getSingleChannel( [ wz.system.user().id , c.id ] , function( error , message ){

            console.log( 'USR1(' , wz.system.user().id , ') USR2(' , c.id , ') CANAL=' , message );

            if ( error ) { console.log('ERROR: ', error ); }

            // Existe el canal
            if (message.length > 0) {

              wz.channel( message[0][ 'id_channel' ] , function( error, channel ){

                if ( error ) { console.log('ERROR: ', error ); }

                appendContact(c , channel);

              });

            }
            // No existe el canal
            else{

              appendContact(c);

            }

        });

      });

    });

}

var getChats = function(){

  wql.getChannels(function( error , message ){

    if ( error ) { console.log('ERROR: ', error ); }

    $.each( message , function( i , channel ){

      wql.getUsersInChannel( channel.id , function( error , users ){

        wz.user.friendList( false, function( error, friends ){

          var isGroup = channel.name != null ? true : false;

          if( !isGroup ){

            var me = wz.system.user().id;
            var you;

            if( me == users[0].user ){

              you = users[1].user;

            }else{

              you = users[0].user;

            }

           $.each( friends , function( index , element ){

             if ( element.id == you ) {

               wz.channel( channel.id , function( error, channel ){

                 appendChat( channel , element );

               });

             }

           });

          }else{

            wz.channel( channel.id , function( error, channel ){

              var usersInGroup = [];

              for (var i = 0; i < users.length; i++) {

                for (var j = 0; j < friends.length; j++) {

                  if ( users[i] == friends[j].id ) {

                    usersInGroup.push( friends[j] );

                  }

                }

              }

              appendChat( channel , usersInGroup );

            });

          }

        });

      });

    });

  });

}

var appendContact = function( c , channel ){

  var contact = contactPrototype.clone();

  contact
      .removeClass( 'wz-prototype' )
      .addClass( 'contactDom' )
      .find( '.contact-name' ).text( c.fullName );
  contact
      .find( '.contact-img' ).css( 'background-image' , 'url(' + c.avatar.big + ')' );
  contact
      .on( 'click' , function(){
        selectContact( $( this ) );
      });
  contact
      .data( 'contact' , c );

  if( channel != undefined ){ contact.data( 'channel' , channel ) }

  contactList.append( contact );

}

var appendChat = function( c , user ){

  wql.getMessages( c.id , function( error, messages ){

    if ( error ) { console.log('ERROR: ', error ); }

    var lastMsg;

    for( var i = 0; i < messages.length; i++ ){

      if( i+1 == messages.length ){

         var lastMsg = messages[i];

      }

    }

    var chat = chatPrototype.clone();

    chat
        .removeClass( 'wz-prototype' )
        .addClass( 'chatDom' );

    var isGroup = c.name != null ? true : false;

    if( !isGroup ){

      chat
          .find( '.channel-name' ).text( user.fullName );
      chat
          .find( '.channel-img' ).css( 'background-image' , 'url(' + user.avatar.big + ')' );

      if(lastMsg != undefined){

        var date = new Date(lastMsg.time);

        chat
            .find( '.channel-last-time' ).text( date.getHours() + ':' + date.getMinutes() );
        chat
            .find( '.channel-last-msg' ).text( lastMsg.text );

      }

    }

    channelList.append( chat );

    chat
        .data( 'channel' , c );
    chat
        .data( 'user' , user );
    chat
        .on( 'click' , function(){
          selectChat( $( this ) );
        });

    setActiveChat( chat );

  });

}

var selectContact = function( contact ){

  var channel = contact.data( 'channel' );

  // Make active
  $( '.contactDom.active' ).removeClass( 'active' );
  contact.addClass( 'active' );
  content.addClass( 'visible' );

  // Set header
  $( '.conversation-name' ).text( contact.find( '.contact-name' ).text() );

  if ( channel == undefined ) {

    $( '.conversation-header' ).data( 'channel' , null );

  }else{

    $( '.conversation-header' ).data( 'channel' , channel );

  }

  // Channel already created
  if( channel != undefined ){

    listMessages( channel );

  }else{

    $( '.messageDom' ).remove();

  }

}

var selectChat = function( chat ){

  var channel = chat.data( 'channel' );

  // Make active
  $( '.chatDom.active' ).removeClass( 'active' );
  chat.addClass( 'active' );
  content.addClass( 'visible' );
  chat.find( '.channel-badge' ).data( 'num' , null );
  chat.find( '.channel-badge' ).removeClass( 'visible' );

  // Set header
  $( '.conversation-name' ).text( chat.find( '.channel-name' ).text() );

  if ( channel == undefined ) {

    $( '.conversation-header' ).data( 'channel' , null );

  }else{

    $( '.conversation-header' ).data( 'channel' , channel );

  }

  // Channel already created
  if( channel != undefined ){

    listMessages( channel );

  }else{

    $( '.messageDom' ).remove();

  }

}

var listMessages = function( channel ){

  $( '.messageDom' ).remove();
  lastMessage.text( '' );

  wql.getMessages( channel.id , function( error, messages ){

    if ( error ) { console.log('ERROR: ', error ); }

    for( var i = 0; i < messages.length; i++ ){

      printMessage( messages[ i ].text , messages[ i ].sender , messages[ i ].time );

      if( i+1 == messages.length ){

        lastMessage.text( timeElapsed( messages[i].time ) );

      }

    }

  });

}

var printMessage = function( text , sender , time , animate ){

  console.log( 'Mensaje' , text , sender , time );

  var me = wz.system.user().id;
  var message;
  var date = new Date( time );
  var hh = date.getHours();
  var mm = date.getMinutes();

  if(hh<10) {
      hh='0'+hh
  }

  if(mm<10) {
      mm='0'+mm
  }

  if( sender == me ){

    message = $( '.message-me.wz-prototype' ).clone();
    message
          .removeClass( 'wz-prototype' )
          .addClass( 'messageDom' )
          .find( '.message-text' ).text( text );
    message
          .find( '.message-time' ).text( hh + ':' + mm );

  }else{

    message = $( '.message-other.wz-prototype' ).clone();
    message
          .removeClass( 'wz-prototype' )
          .addClass( 'messageDom' )
          .find( '.message-text' ).text( text );
    message
          .find( '.message-time' ).text( hh + ':' + mm );

    if ( chatButton.hasClass( 'active' ) ) {

      message
            .find( '.message-avatar' ).css( 'background-image' , $( '.chatDom.active' ).find( '.channel-img' ).css( 'background-image' ) );

    }else{

      message
            .find( '.message-avatar' ).css( 'background-image' , $( '.contactDom.active' ).find( '.contact-img' ).css( 'background-image' ) );

    }

  }

  $( '.message-container' ).append( message );

  if(animate){

    $( '.message-container' ).stop().clearQueue().animate( { scrollTop : message[0].offsetTop }, 400  );

  }else{

    $( '.message-container' ).scrollTop( message[0].offsetTop );

  }

}

var initChat = function(){

  app.css({'border-radius'    : '6px',
           'background-color' : '#2c3238'
  });

  setTexts();
  checkTab();

}

var sendMessage = function(){

  var txt = $( '.conversation-input input' ).val();
  var channel = $( '.conversation-header' ).data( 'channel' );
  var contactApi = $( '.contactDom.active' ).data( 'contact' );

  if ( channel == null ) {

    wz.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addChannel( [ channel.id , null ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , contactApi.id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.addUserInChannel( [ channel.id , wz.system.user().id ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( contactApi.id , function(){

              $( '.contactDom.active' ).data( 'channel' , channel );
              $( '.conversation-header' ).data( 'channel' , channel );
              send( txt , channel );

            });

          });

        });

      });

    });

  }else{

    send( txt , channel );

  }

}

var send = function( message , channel ){

  if( message != '' ){

    channel.send( message , function( error ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addMessage( [ message , wz.system.user().id , channel.id ] , function( error , messages ){

        if ( error ) { console.log('ERROR: ', error ); }

        // Clean sender
        $( '.conversation-input input' ).val('');

      });

    });

  }

}

var timeElapsed = function( lastTime ){

  var now = new Date();
  var last = new Date( lastTime );

  if( now.getFullYear() > last.getFullYear() ){

    return lang.last + ' ' + ( now.getFullYear() - last.getFullYear() ) + ' ' + lang.years;

  }else if( now.getMonth() > last.getMonth() ){

    return lang.last + ' ' + ( now.getMonth() - last.getMonth() ) + ' ' + lang.months;

  }else if( now.getDate() > last.getDate() ){

    return lang.last + ' ' + ( now.getDate() - last.getDate() ) + ' ' + lang.days;

  }else if( now.getHours() > last.getHours() ){

    return lang.last + ' ' + ( now.getHours() - last.getHours() ) + ' ' + lang.hours;

  }else{

    return lang.last + ' ' + ( now.getMinutes() - last.getMinutes() ) + ' ' + lang.minutes;

  }

}

var startsWithContacts = function( wordToCompare ){

  return function( index , element ) {

      return $( element ).find( '.contact-name' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;

  }

}

var startsWithChats = function( wordToCompare ){

  return function( index , element ) {

      return $( element ).find( '.channel-name' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;

  }

}

var filterElements = function( filter ){

  // Search chats
  if ( chatButton.hasClass( 'active' ) ) {

    var chats = $( '.chatDom' );
    chats.show();
    var chatsToShow = chats.filter( startsWithChats( filter ) );
    var chatsToHide = chats.not( chatsToShow );
    chatsToHide.hide();

  // Search contacts
  }else{

    var contacts = $( '.contactDom' );
    contacts.show();
    var contactsToShow = contacts.filter( startsWithContacts( filter ) );
    var contactsToHide = contacts.not( contactsToShow );
    contactsToHide.hide();

  }

}

var setActiveChat = function( chat ){

  var channelActive = $( '.conversation-header' ).data( 'channel' );

  if (channelActive != undefined && chat.data( 'channel' ).id == channelActive.id) {

    chat.click();

  }

}

var messageRecived = function( message , txt ){

  var channelActive = $( '.conversation-header' ).data( 'channel' );
  var date = new Date();

  if( channelActive.id == message.id ){

    printMessage( txt , message.sender , date.getTime() , true );

    lastMessage.text( timeElapsed( date.getTime() ) );

  }else{

    var chats = $( '.chatDom' );

    for (var i = 0; i < chats.length; i++) {

      if ( chats[i].id == message.id ) {

        var num = chats[i].find( '.channel-badge' ).data( 'num' );
        if ( !num ) {

          chats[i].find( '.channel-badge' ).data( 'num' , 1 );
          chats[i].find( '.channel-badge' ).addClass( 'visible' );
          chats[i].find( '.channel-badge span' ).text(1);

        }else{

          chats[i].find( '.channel-badge' ).data( 'num' , ++num );
          chats[i].find( '.channel-badge span' ).text( num );

        }

      }

    }

  }

}


// INIT Chat
initChat();
