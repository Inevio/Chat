var myContacts = [];

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
var backGroup         = $( '.group-menu .back' );
var memberPrototype   = $( '.member.wz-prototype' );
var memberList        = $( '.member-list' );
var cancelNewGroup    = $( '.cancel-group' );
var saveNewGroup      = $( '.save-group' );
var removeGroup       = $( '.remove-group' );
var myContactID       = api.system.user().id;

// COLOR PALETTE
var colorPalette = [
  {name: 'blue' , light: '#a6d2fa', text:'#2a77ad' , border:'#1664a5'},
  {name: 'green' , light: '#badb95', text:'#306e0d' , border:'#3c7919'},
  {name: 'purple' , light: '#d8ccf1', text:'#9064e1' , border:'#6742aa'},
  {name: 'orange' , light: '#f7c97e', text:'#b45d1f' , border:'#f68738'},
  {name: 'brown' , light: '#b2a59d', text:'#5a4638' , border:'#6e5646'},
  {name: 'green2' , light: '#8cd0b3', text:'#0a5a36' , border:'#128a54'},
  {name: 'red' , light: '#ec9a97', text:'#912521' , border:'#e13d35'},
  {name: 'pink' , light: '#f7beec', text:'#9c4ba5' , border:'#b44b9f'},
  {name: 'grey' , light: '#97a1a9', text:'#353b43' , border:'#384a59'},
  {name: 'yellow' , light: '#fbe27d', text:'#84740b' , border:'#ffb400'},
];

var colors = [ '#4fb0c6' , '#d09e88' , '#fab1ce' , '#4698e0' , '#e85c5c', '#efdc05', '#5cab7d' , '#a593e0', '#fc913a' , '#58c9b9' ]

// DOM Events
app.key( 'f1' , function(){
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

app.key( 'enter' , function(){
  sendMessage();
});

searchBox.on( 'input' , function(){
  filterElements( $( this ).val() );
});

api.channel.on( 'message' , function( message , text ){
  messageReceived( message , text );
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
  newGroup();
});

backGroup.on( 'click' , function(){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

});

cancelNewGroup.on( 'click' , function(){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

});

saveNewGroup.on( 'click' , function(){
  saveGroup();
});

api.channel.on( 'destroyed' , function( info ){
  chatDeleted( info );
});

api.channel.on( 'userAdded', function( info, userId ){
  userAdded( info , userId );
});

removeGroup.on( 'click' , function(){
  deleteOrExitGroup();
});

wz.user.on( 'connect' , function( user ){

  updateContactState( $( '.user-id-' + user.id ) , true , user.id );

});

wz.user.on( 'disconnect' , function( user ){

  updateContactState( $( '.user-id-' + user.id ) , false , user.id );

});

// FUNCTIONS
var setTexts = function(){

  $( '.chat-tab-selector span' ).text(lang.chats);
  $( '.contact-tab-selector span' ).text(lang.contacts);
  $( '.conversation-input input' ).attr('placeholder', lang.msg);
  $( '.chat-search input' ).attr('placeholder', lang.search);;
  $( '.close-coversation' ).text(lang.close);
  $( '.conversation-send' ).text(lang.send);
  $( '.new-group-button span' ).text(lang.newGroup);
  $( '.no-chat-txt' ).text(lang.noChat);
  $( '.group-menu .back span' ).text(lang.back);
  $( '.group-menu .edit' ).text(lang.edit);
  $( '.group-info .title' ).text(lang.info);
  $( '.group-members .title' ).text(lang.MEMBERS);
  $( '.group-create-txt' ).text(lang.newGroupTitle);
  $( '.save-group span' ).text(lang.save);
  $( '.cancel-group span' ).text(lang.cancel);
  $( '.group-name-input input' ).attr('placeholder', lang.groupName);

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

    // Make it active and visible
    case 'chat':

      contactsButton.removeClass('active');
      chatButton.addClass('active');
      contactTab.removeClass( 'visible' );
      chatTab.addClass( 'visible' );
      newGroupButton.removeClass( 'visible' );
      groupMenu.removeClass( 'visible' );
      removeGroup.removeClass( 'visible' );

      break;

    // Make it active and visible
    case 'contact':

      chatButton.removeClass( 'active' );
      contactsButton.addClass( 'active' );
      chatTab.removeClass( 'visible' );
      contactTab.addClass( 'visible' );
      newGroupButton.addClass( 'visible' );

      break;

  }

}

var getContacts = function(){

  api.user.friendList( false, function( error, list ){

    if ( error ) { console.log('ERROR: ', error ); }

    asyncEach( list , function( c , cb ){

      wql.getSingleChannel( [ myContactID , c.id ] , function( error , message ){

        console.log( 'USR1(' , myContactID , ') USR2(' , c.id , ') CANAL=' , message );

        if ( error ) { console.log('ERROR: ', error ); }

        // Existe el canal
        if (message.length > 0) {

          api.channel( message[0][ 'id_channel' ] , function( error, channel ){

            if ( error ) { console.log('ERROR: ', error ); }

            appendContact( c , channel , cb );

          });

        }
        // No existe el canal
        else{
          appendContact( c , null , cb );
        }

      });

    } , function(){

      api.user.connectedFriends( true, function( error, list ){

        $.each( list , function( i , friendId ){

          var friend = $( '.user-id-' + friendId );

          updateContactState( friend , true , friendId );

        });

      });

    });

  });

}

var getChats = function(){

  wql.getChannels( myContactID , function( error , channels ){

    if ( error ) { console.log('ERROR: ', error ); }

    if( !channels.length ){
      return contactsButton.click();
    }

    $.each( channels , function( i , channel ){

      // No repeat chats already appended
      if ( $( '.chatDom-' + channel.id ).length != 0 ) {

        console.log('ya esta metido!');
        return;

      }

      wql.getUsersInChannel( channel.id , function( error , users ){

        api.user.friendList( false, function( error, friends ){

          var isGroup = channel.name != null ? true : false;
          var groupName = channel.name;

          if( !isGroup ){

            var me = myContactID;
            var you;

            if( me == users[0].user ){

              you = users[1].user;

            }else{

              you = users[0].user;

            }

            $.each( friends , function( index , element ){

              if ( element.id == you ) {

                api.channel( channel.id , function( error, channel ){

                  console.log('APPENDING CHAT' , channel , element , groupName);
                  appendChat( channel , element , groupName );

                });

              }

            });

          }else{

            api.channel( channel.id , function( error, channel ){

              var usersInGroup = [];

              for (var i = 0; i < users.length; i++) {

                for (var j = 0; j < friends.length; j++) {

                  if ( users[i].user == friends[j].id ) {

                    usersInGroup.push( friends[j] );

                  }

                }

              }

              console.log('APPENDING GROUP' , channel , usersInGroup , groupName);
              appendChat( channel , usersInGroup , groupName );

            });

          }

        });

      });

    });

  });

}

var appendContact = function( c , channel , callback ){

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
  contact
  .addClass( 'user-id-' + c.id );

  myContacts.push( { id : c.id , status : false } );

  if( channel != undefined ){ contact.data( 'channel' , channel ) }

  var list = $( '.contactDom' );

  if ( list.length > 0 ) {

    var inserted = false;
    $.each( list , function( i , o ){

      if( !inserted && c.fullName.localeCompare( $(o).find( '.contact-name' ).text() ) === -1 ){

        inserted = true;
        $(o).before( contact );

      }

    });

    if ( !inserted ) {
      list.eq( list.length - 1 ).after( contact );
    }

  }else{
    contactList.append( contact );
  }

  callback();

}

var appendChat = function( c , user , groupName ){

  chatButton.click();

  wql.getMessages( c.id , function( error, messages ){

    console.log([c.id, myContactID]);
    wql.getLastRead( [c.id, myContactID] , function( error , lastRead ){

      console.log([c.id, lastRead[0]['last_read']]);
      wql.getUnreads( [c.id, lastRead[0]['last_read']] , function( error , notSeen ){

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
        .addClass( 'chatDom' )
        .addClass( 'chatDom-' + c.id );

        if( groupName == null ){

          chat
          .find( '.channel-name' ).text( user.fullName );
          chat
          .find( '.channel-img' ).css( 'background-image' , 'url(' + user.avatar.big + ')' );

          if(lastMsg != undefined){

            var date = new Date(lastMsg.time);

            chat
            .find( '.channel-last-time' ).text( getStringHour( date ) );
            chat
            .find( '.channel-last-msg' ).text( lastMsg.text );

          }

        }else{

          chat
          .find( '.channel-name' ).text( groupName );

          setGroupAvatar( groupName , chat.find( '.channel-img' ) );

          if(lastMsg != undefined){

            var date = new Date(lastMsg.time);

            chat
            .find( '.channel-last-time' ).text( getStringHour( date ) );
            chat
            .find( '.channel-last-msg' ).text( lastMsg.text );

          }

        }

        // No repeat chats already appended
        if ( $( '.chatDom-' + c.id ).length != 0 ) {

          console.log('ya esta metido!');
          return;

        }else{

          channelList.append( chat );
          if ( notSeen[0] != undefined && notSeen[0]['COUNT(*)'] > 0 ) {

            $('.chatDom-' + c.id).data( 'notSeen' , notSeen[0]['COUNT(*)'] );
            $('.chatDom-' + c.id).find( '.channel-badge' ).addClass('visible').find('span').text( notSeen[0]['COUNT(*)'] );

          }

        }

        chat
        .data( 'channel' , c );
        chat
        .data( 'user' , user );
        chat
        .data( 'isGroup' , groupName );
        chat
        .on( 'click' , function(){
          selectChat( $( this ) );
        });

        /*if ( notSeen[0]['not_seen'] > 0 ) {

          chat.data( 'notSeen' , notSeen[0]['not_seen'] );
          chat.find( '.channel-badge' ).addClass( 'visible' );
          chat.find( '.channel-badge span' ).text( notSeen[0]['not_seen'] );

        }*/

        setActiveChat( chat );

      });

    });

  });

}

var selectContact = function( contact ){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

  $( '.conversation-input input' ).focus();

  var channel = contact.data( 'channel' );

  // Make active
  $( '.contactDom.active' ).removeClass( 'active' );
  contact.addClass( 'active' );
  content.addClass( 'visible' );

  // Set header
  $( '.conversation-name' ).text( contact.find( '.contact-name' ).text() );

  if ( channel == undefined ) {

    //$( '.conversation-header' ).data( 'channel' , null );
    $( '.messageDom' ).remove();

  }else{

    //$( '.conversation-header' ).data( 'channel' , channel );
    listMessages( channel );

  }

  if ( contact.hasClass( 'conected' ) ) {

    lastMessage.text( lang.conected );

  }else{

    lastMessage.text( lang.disconected );

  }

}

var selectChat = function( chat ){

  groupMenu.removeClass( 'visible' );
  removeGroup.removeClass( 'visible' );

  $( '.conversation-input input' ).focus();

  var channel = chat.data( 'channel' );
  var contact = chat.data( 'user' );

  // Make active
  $( '.chatDom.active' ).removeClass( 'active' );
  chat.addClass( 'active' );
  content.addClass( 'visible' );

  // Set header
  $( '.conversation-name' ).text( chat.find( '.channel-name' ).text() );

  if ( channel == undefined ) {

    //$( '.conversation-header' ).data( 'channel' , null );
    $( '.messageDom' ).remove();


  }else{

    //$( '.conversation-header' ).data( 'channel' , channel );
    listMessages( channel );

    chat.data( 'notSeen' , null );
    chat.find( '.channel-badge' ).removeClass( 'visible' );

    if( chat.data( 'isGroup' ) != null ){

      $( '.conversation-header' ).off( 'click' );
      $( '.conversation-header' ).on( 'click' , function(){

        viewGroup();

      });

    }

    /*wql.updateChannelSeen( [ 0 , channel.id, contact.id ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

    });*/

    if ( !Array.isArray( contact ) && isConected( contact.id ) ) {

      lastMessage.text( lang.conected );

    }else{

      lastMessage.text( lang.disconected );

    }

  }

}

var listMessages = function( channel ){

  $( '.messageDom' ).remove();

  wql.getMessages( channel.id , function( error, messages ){

    if ( error ) { console.log('ERROR: ', error ); }

    for( var i = 0; i < messages.length; i++ ){

      if ( messages[i].sender == myContactID ) {

        printMessage( messages[ i ].text , null , messages[ i ].time );

      }else{

        var users = $( '.chatDom.active' ).data( 'user' );

        if ( !Array.isArray( users ) ) {

          printMessage( messages[ i ].text , users , messages[ i ].time );

        }else{

          for (var j = 0; j < users.length; j++) {

            if ( users[j].id == messages[ i ].sender ) {

              printMessage( messages[ i ].text , users[j] , messages[ i ].time );

            }

          }

        }

      }

    }

    wql.updateLastRead( [ messages[ messages.length - 1].id , channel.id, myContactID ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }
      $('.chatDom.active').data( 'notSeen' , 0 );
      $('.chatDom.active').find('.channel-badge').removeClass('visible').find('span').text(0);

    });

  });

}

var isConected = function( user ){

  var conected = false;

  for (var i = 0; i < myContacts.length; i++) {

    if ( myContacts[i].id = user && myContacts[i].status ) {

      conected = true;

    }

  }

  return conected;

}

var printMessage = function( text , sender , time , animate ){

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

  if( sender == null ){

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
    message
    .find( '.message-text' ).text( text );

    if ( $( '.chatDom.active' ).data( 'isGroup' ) != null ) {

      var senderName = sender.fullName;
      message.find( '.sender' ).addClass( 'visible' );
      message.find( '.sender' ).text( senderName );
      message.find( '.sender' ).css( 'color' , colors[ selectColor( senderName ) ] );

    }

    message
    .find( '.message-time' ).text( hh + ':' + mm );

    message
    .find( '.message-avatar' ).css( 'background-image' , 'url(' + sender.avatar.big + ')' );

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
  getContacts();
  getChats();

}

var sendMessage = function(){

  var txt = $( '.conversation-input input' ).val();
  var channel = $( '.chatDom.active' ).data( 'channel' );
  var contactApi = $( '.contactDom.active' ).data( 'contact' );

  // Clean sender
  $( '.conversation-input input' ).val('');

  if ( channel == null ) {

    api.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addChannel( [ channel.id , null ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , contactApi.id ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.addUserInChannel( [ channel.id , myContactID ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( contactApi.id , function(){

              $( '.contactDom.active' ).data( 'channel' , channel );
              $( '.chatDom.active' ).data( 'channel' , channel );
              send( txt , channel );
              console.log('getChat - sendMessage');
              getChats();

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

    wql.addMessage( [ message , myContactID , channel.id ] , function( error , messages ){

      if ( error ) { console.log('ERROR: ', error ); }
      console.log(arguments);

      channel.send( [ message, messages.insertId ] , function( error ){

        if ( error ) { console.log('ERROR: ', error ); }

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

  var channelActive = $( '.chatDom.active' ).data( 'channel' );

  if (channelActive != undefined && chat.data( 'channel' ).id == channelActive.id) {
    chat.click();
  }

}

var messageReceived = function( message , txt ){

  var channelActive = $( '.chatDom.active' ).data( 'channel' );
  var chat          = $( '.chatDom-' + message.id );
  var date          = Date.now();
  var printed       = false;

  setChatInfo( chat , txt );

  console.log( message );
  if( channelActive && channelActive.id === message.id ){

    if( message.sender === myContactID ){

      wql.updateLastRead( [ txt[1] , channelActive.id, myContactID ] , function( error , message ){
        if ( error ) { console.log('ERROR: ', error ); }
        printMessage( txt[0] , null , date , true );
      });

    }else{

      var users = chat.data('user');
      console.log( users );

      if( !Array.isArray( users ) ){

        wql.updateLastRead( [ txt[1] , channelActive.id, myContactID ] , function( error , message ){
          if ( error ) { console.log('ERROR: ', error ); }
          printMessage( txt[0] , users , date , true );
        });

      }else{

        for (var j = 0; j < users.length; j++) {

          if ( users[j].id === message.sender ) {
            wql.updateLastRead( [ txt[1] , channelActive.id, myContactID ] , function( error , message ){
              if ( error ) { console.log('ERROR: ', error ); }
              printMessage( txt[0] , users[j] , date , true );
            });
          }

        }
      }
    }

  }else{

    wql.getLastRead( [message.id, myContactID] , function( error , lastRead ){

      wql.getUnreads( [message.id, lastRead[0]['last_read'] ] , function( error , notSeen ){

        //console.log( [message.id, message.sender, txt[1] ] );

        if ( notSeen[0] != undefined && notSeen[0]['COUNT(*)'] > 0 ) {

          $('.chatDom-' + message.id).data( 'notSeen' , notSeen[0]['COUNT(*)'] );
          $('.chatDom-' + message.id).find( '.channel-badge' ).addClass('visible').find('span').text( notSeen[0]['COUNT(*)'] );

        }

      });

    });

  }

}

var setChatInfo = function( chat , txt ){

  chat.insertBefore( $( '.chatDom' ).eq(0) );
  chat.find( '.channel-last-msg' ).text( txt[0] );
  chat.find( '.channel-last-time' ).text( getStringHour( new Date() ) );

}

var getStringHour = function( date ){

  var hh = date.getHours();
  var mm = date.getMinutes();

  if(hh<10) {
    hh='0'+hh
  }

  if(mm<10) {
    mm='0'+mm
  }

  return hh + ':' + mm;

}

var newGroup = function(){

  // Make it visible
  $( '.group-menu .visible' ).removeClass( 'visible' );
  groupMenu.addClass( 'visible' ).addClass( 'group-new' );
  $( '.group-new' ).addClass( 'visible' );
  $( '.group-name-input' ).val( '' );

  setGroupAvatar( '?' , $( '.group-avatar' ) );

  $( '.memberDom' ).remove();
  api.user.friendList( false, function( error, list ){

    $.each( list , function( index , friend ){

      appendMember( friend );

    });

    $( '.search-members input' ).on( 'input' , function(){

      filterMembers( $( this ).val() );

    });

  });

}

var filterMembers = function( filter ){

  var members = $( '.memberDom' );
  members.show();
  var membersToShow = members.filter( startsWithMember( filter ) );
  var membersNotToShow = members.not( membersToShow );
  membersNotToShow.hide();

}

var startsWithMember = function( wordToCompare ){

  return function( index , element ) {

    return $( element ).find( 'span' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;

  }

}

var saveGroup = function(){

  if ( groupMenu.hasClass( 'group-edit' ) ) {

    editGroup();

  }else{

    createNewGroup();

  }

}

var editGroup = function(){

  var groupName = $( '.group-name-input input' ).val();
  var members = $( '.memberDom.active' );
  var channel = $( '.chatDom.active' ).data( 'channel' );

  if ( groupName != '' ) {

    if ( members.length == 0 ) {

      alert( lang.noMemberError );
      return;

    }

    wql.updateChannelName( [ groupName , channel.id ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.getUsersInChannel( channel.id , function( error , users ){

        if ( error ) { console.log('ERROR: ', error ); }

        $.each( users , function( i , user ){

          channel.removeUser( user.user , function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

          });

        });

        wql.deleteUsersInChannel( channel.id , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.addUserInChannel( [ channel.id , myContactID ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( myContactID , function(){

              $.each( members , function( index , member ){

                var contact = $( member ).data( 'contact' );

                wql.addUserInChannel( [ channel.id , contact.id ] , function( error , message ){

                  if ( error ) { console.log('ERROR: ', error ); }

                  channel.addUser( contact.id , function(){

                    groupMenu.removeClass( 'visible' );
                    removeGroup.removeClass( 'visible' );

                  });

                });

              });

            });

          });

        });

      });

    });

  }else{

    alert( lang.groupNameError );

  }

}

var createNewGroup = function(){

  var groupName = $( '.group-name-input input' ).val();
  var members = $( '.memberDom.active' );

  if ( groupName != '' ) {

    if ( members.length == 0 ) {

      alert( lang.noMemberError );
      return;

    }

    api.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addChannel( [ channel.id , groupName ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , myContactID ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.addUser( myContactID , function(){

            $.each( members , function( index , member ){

              var contact = $( member ).data( 'contact' );

              wql.addUserInChannel( [ channel.id , contact.id ] , function( error , message ){

                if ( error ) { console.log('ERROR: ', error ); }

                channel.addUser( contact.id , function(){

                  groupMenu.removeClass( 'visible' );
                  removeGroup.removeClass( 'visible' );
                  getChats();

                });

              });

            });

          });

        });

      });

    });

  }else{

    alert( lang.groupNameError );

  }

}

var setGroupAvatar = function( groupName , avatar ){

  var expNameWords = groupName.split(' ');

  avatar.html( '<span>' + (expNameWords[0] || ' ')[0].toUpperCase() + (expNameWords[1] || ' ')[0].toUpperCase() + '</span>');

  var colorId = selectColor( groupName );

  avatar.css('background-image', 'none');
  avatar.css('background-color', colorPalette[colorId].light);
  avatar.css('border', '1px solid ' + colorPalette[colorId].border);
  avatar.css('border-style', 'solid');
  avatar.find( 'span' ).css('color', colorPalette[colorId].text);

}


var selectColor = function( string ){

  var id = 0;

  for (var i = 0; i < string.length; i++) {

    id += string.charCodeAt(i);
    id++;

  }

  return id = id%colorPalette.length;

}

var viewGroup = function(){

  // Make it visible
  $( '.group-menu .visible' ).removeClass( 'visible' );
  groupMenu.addClass( 'visible' ).addClass( 'group-view' );
  $( '.group-view' ).addClass( 'visible' );

  $( '.memberDom' ).remove();
  var members = $( '.chatDom.active' ).data( 'user' );
  var groupName = $( '.chatDom.active' ).data( 'isGroup' );

  $( '.group-name' ).text( groupName );

  if ( members ) {

    $( '.group-members-txt' ).text( ( members.length + 1 ) + ' ' + lang.members );

  }else{

    $( '.group-members-txt' ).text( '1 ' + lang.members );

  }

  setRemoveButton();

  setGroupAvatar( groupName , $( '.group-avatar' ) );

  api.user( myContactID , function( error, user ){

    $( '.memberDom' ).remove();

    $( '.chatDom.active' ).data( 'channel' ).list( function( error, users ){

      var admin = users[0];

      appendMember( user , admin ).addClass( 'me' );

      $.each( members , function( index , m ){

        appendMember( m , admin );

      });

      $( '.search-members input' ).off( 'input' );
      $( '.search-members input' ).on( 'input' , function(){

        filterMembers( $( this ).val() );

      });

      $( '.group-header .edit' ).off( 'click' );
      $( '.group-header .edit' ).on( 'click' , function(){

        editGroupMode( groupName );

      });

    });

  });

}

var editGroupMode = function( groupName ){

  $( '.group-menu .visible' ).removeClass( 'visible' );
  groupMenu.addClass( 'visible' ).addClass( 'group-edit' );
  $( '.group-edit' ).addClass( 'visible' );

  $( '.group-name-input input' ).val( groupName );

  $( '.memberDom' ).remove();

  api.user.friendList( false, function( error, list ){

    $( '.chatDom.active' ).data( 'channel' ).list( function( error, users ){

      var admin = users[0];

      $.each( list , function( index , friend ){

        appendMember( friend , admin );

      });

      $.each( $( '.memberDom' ) , function( index , member ){

        $.each( $( '.chatDom.active' ).data( 'user' ) , function( index , memberAdded ){

          if ( $( member ).data( 'contact' ).id == memberAdded.id ) {

            $( member ).find( '.ui-checkbox' ).addClass( 'active' );
            $( member ).addClass( 'active' );

          }

        });

      });

      $( '.search-members input' ).off( 'input' );
      $( '.search-members input' ).on( 'input' , function(){

        filterMembers( $( this ).val() );

      });

    });

  });

}

var appendMember = function( user , admin ){

  var member = memberPrototype.clone();
  member
  .removeClass( 'wz-prototype' )
  .addClass( 'memberDom' )
  .find( '.member-avatar' ).css( 'background-image' , 'url(' + user.avatar.big + ')' );

  if( user.id == admin ){

    member.find( 'span' ).text( user.fullName + ' (' + lang.admin + ')' );

  }else{

    member.find( 'span' ).text( user.fullName );

  }

  member.find( 'span' ).on( 'click' , function(){

    $( this ).parent().find( '.ui-checkbox' ).toggleClass( 'active' );
    $( this ).parent().toggleClass( 'active' );

  });

  member.find( '.member-avatar' ).on( 'click' , function(){

    $( this ).parent().find( '.ui-checkbox' ).toggleClass( 'active' );
    $( this ).parent().toggleClass( 'active' );

  });

  member.find( '.ui-checkbox' ).on( 'click' , function(){

    $( this ).parent().toggleClass( 'active' );

  });

  member.data( 'contact' , user );

  memberList.append( member );

  return member;

}

var chatDeleted = function( info ){

  var chats = $( '.chatDom' );

  $.each( chats , function( index , chat ){

    var channel = $( chat ).data( 'channel' );

    if ( channel.id == info.id ) {

      var chat = $( chat );

      if ( chat.hasClass( 'active' ) ) {

        groupMenu.removeClass( 'visible' );
        removeGroup.removeClass( 'visible' )

      }

      chat.remove();

    }

  });

}

var userAdded = function( info , userId ){

  if( info.sender != myContactID && myContactID == userId ){

    getChats();

  }

}

var setRemoveButton = function(){

  var channel = $( '.chatDom.active' ).data( 'channel' );
  removeGroup.addClass( 'visible' );
  removeGroup.off( 'click' );

  channel.list( function( error, users ){

    var admin = users[0];

    // I'm the admin
    if ( myContactID == admin ) {

      removeGroup.find( 'span' ).text(lang.deleteExit);

      removeGroup.on( 'click' , function(){

        wql.deleteUsersInChannel( channel.id , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          wql.deleteChannel( channel.id , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.destroy();

            groupMenu.removeClass( 'visible' );
            removeGroup.removeClass( 'visible' );
            $( '.chatDom.active' ).remove();
            content.removeClass( 'visible' );

          });

        });

      });

    }else{

      removeGroup.find( 'span' ).text(lang.exitGroup);

      removeGroup.on( 'click' , function(){

        wql.deleteUserInChannel( [ channel.id , myContactID ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.leave( function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

            groupMenu.removeClass( 'visible' );
            removeGroup.removeClass( 'visible' );
            $( '.chatDom.active' ).remove();
            content.removeClass( 'visible' );

          });

        });

      });

    }

  });

}

var updateContactState = function( friend , state , id ){

  if ( state ) {

    friend.addClass( 'conected' );

    for (var i = 0; i < myContacts.length; i++) {

      if ( myContacts[i].id == id ) {

        myContacts[i].status = true;

      }

    }

  }else{

    friend.removeClass( 'conected' );

    for (var i = 0; i < myContacts.length; i++) {

      if ( myContacts[i].id == id ) {

        myContacts[i].status = false;

      }

    }

  }

}

var asyncEach = function( list, step, callback ){

  var position = 0;
  var closed   = false;
  var checkEnd = function( error ){

    if( closed ){
      return;
    }

    position++;

    if( position === list.length || error ){

      closed = true;

      callback( error );

      // Nullify
      list = step = callback = position = checkEnd = closed = null;

    }

  };

  if( !list.length ){
    return callback();
  }

  list.forEach( function( item ){
    step( item, checkEnd );
  });

};

// INIT Chat
initChat();
