// CHAT 1.0.11
var mobile = true;
var animationDuration = 500;
var mode = 0; // 0 == Chats tab, 1 == Contacts tab, 2 == Conversation tab, 3 == Information tab, 4 == creating group, 5 == editing group, -1 == transition
var prevMode = 0;

var myContacts = [];
var groupMembers = [];
var me;
var lastMsg;
var warnWritingTimeOut = false;
var listenWritingTimeOut = false;
var loadingMsgs = false;
var currentDate;
var firstLoad;

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
var lastMessage       = $( '.conversation-moreinfo, .conver-moreinfo' );
var searchBox         = $( '.chat-search input' );
var searchBoxDelete   = $( '.chat-search .delete-content' );
var closeChatButton   = $( '.close-coversation' );
var newGroupButton    = $( '.new-group-button, .new-group' );
var groupMenu         = $( '.group-menu' );
var backGroup         = $( '.group-menu .back' );
var memberPrototype   = $( '.member.wz-prototype' );
var memberList        = $( '.member-list' );
var cancelNewGroup    = $( '.cancel-group' );
var saveNewGroup      = $( '.save-group, .accept-button' );
var removeGroup       = $( '.remove-group' );
var conversationDel   = $( '.conversation-input .delete-content' );
var closeApp          = $( '.ui-close' );
var searchMembers     = $( '.search-members input' );
var msgInput          = $( '.conversation-input textarea' );
var colorChange       = $( '.app-color' );
var msgContainer      = $( '.message-container' );
var separatorPrototype = $( '.separator.wz-prototype' );
var backButton        = $( '.back-button' );
var myContactID       = api.system.user().id;
var adminMode         = false;

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

var colors = [ '#4fb0c6' , '#d09e88' , '#fab1ce' , '#4698e0' , '#e85c5c', '#ebab10', '#5cab7d' , '#a593e0', '#fc913a' , '#58c9b9' ]

// --- EVENTS ---
// SERVER EVENTS
api.channel.on( 'message' , function( message , text ){
  objectRecieved( message , text );
});

api.channel.on( 'destroyed' , function( info ){
  chatDeleted( info );
});

api.channel.on( 'userAdded', function( info, userId ){
  userAdded( info , userId );
});

wz.user.on( 'connect' , function( user ){

  updateContactState( $( '.user-id-' + user.id ) , true , user.id );
  updateState( user.id , true );

});

wz.user.on( 'disconnect' , function( user ){

  updateContactState( $( '.user-id-' + user.id ) , false , user.id );
  updateState( user.id , false );

});

wz.user.on( 'friendAdded', function( user ){
  getContacts();
});

wz.user.on( 'friendRemoved', function( user ){
  getContacts();
});
// END SERVER EVENTS


// UI EVENTS
chatButton.on( 'click' , function(e){
  changeTab('chat');
});

contactsButton.on( 'click' , function(){
  changeTab('contact');
  searchBox.focus();
});

sendButton.on( 'click' , function(){
  msgInput.css('height','24px');
  sendMessage();
});

searchBoxDelete.on( 'click' , function(){
  filterElements( '' );
});

searchBox.on( 'input' , function(){
  filterElements( $( this ).val() );
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

removeGroup.on( 'click' , function(){
  deleteOrExitGroup();
});

conversationDel.on( 'click' , function(){

  msgInput.val('');

});

closeApp.on( 'click' , function(){

  var position = wz.view.getPosition();

  wql.updateUserPreference( [ myContactID , app.width() , app.height() , $( '.ui-window' ).hasClass('dark') , position.x , position.y , app.width() , app.height() , $( '.ui-window' ).hasClass('dark') , position.x , position.y ] , function( error , message ){

    console.log(error, message);

  });

});

searchMembers.on( 'input' , function(){

  filterMembers( $( this ).val() );

});

content.on( 'click' , function(){

  var selection = $(this).selection();
  if (!selection || selection.width === 0) {
    msgInput.focus();
  }

});

msgInput.on( 'keydown' , function(){

  if ( !warnWritingTimeOut ) {

    warnWriting();

  }

});

colorChange.on( 'click' , function(){

  if ( $( '.ui-window' ).hasClass( 'dark' ) ) {

    $(this).find('i').stop().clearQueue().transition({

      'margin-left' : '18px'

    }, 250);

  }else{

    $(this).find('i').stop().clearQueue().transition({

      'margin-left' : '2px'

    }, 250);

  }

  $( '.ui-window' ).toggleClass( 'dark' );
  $( '.conversation-input input' ).val('');

});

msgContainer.on( 'scroll' , function( e ){

  if ( loadingMsgs ) {
    e.preventDefault();
  }

  if ( $(this).scrollTop() < 200 ) {

    loadMoreMsgs();

  }

});

app.on( 'app-param', function( e, params ){

  var action = params[0];
  var world = params[1];
  var callback = params[2];

  if (!world.owner) {
    return;
  }

  switch (action) {

    case 'new-chat':


    api.channel( function( error , channel ){

      if ( error ) { console.log('ERROR: ', error ); }

      wql.addWorldChannel( [ channel.id , world.name , world.id ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.addUserInChannel( [ channel.id , myContactID ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.addUser( myContactID , function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

            callback( 'chat generado, todo ok!' );
            wz.app.removeView(app);

          });

        });

      });

    });
    break;


  }

});

// END UI EVENTS

// APP EVENTS
app
.on( 'contextmenu', '.chatDom', function(e){

  var menu = api.menu();
  var channelNotFound = true;
  var channelDom = $( e.target );

  while (channelNotFound) {

    if( channelDom.hasClass( 'chatDom' ) ){
      channelNotFound = false;
    }else{
      channelDom = channelDom.parent();
    }

  }

  var channel = channelDom.data( 'channel' );
  var user = channelDom.data('user').id;

  if ( !channelDom.data('isGroup') ) {

    menu.addOption( lang.deleteChat , function(){

      wql.deleteUsersInChannel( channel.id , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }

        wql.deleteChannel( channel.id , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.destroy();

          $( '.chatDom.active' ).remove();
          content.removeClass( 'visible' );
          $( '.user-id-' + user ).data( 'channel' , null );

        });

      });

    });
  }

  menu.render();

})

.on( 'click' , '.chatDom' , function(){

  selectChat( $( this ) );
  setTimeout(function(){ $( '.message-container' ).scrollTop(9999999); }, 100);

})

.on( 'ui-view-focus', function(){

  var chatActive = $( '.chatDom.active' );
  if (chatActive.length > 0) {
    selectChat( chatActive );
  }

})

.on( 'keypress', function( e ){

  if( e.which === 13 ){

    if ( !e.shiftKey ) {

      e.preventDefault();
      sendMessage();

    }

  }
})

.on( 'click' , '.viewGroup' , function(){

  viewGroup();

})

.on( 'click' , '.contactDom' , function(){

  selectContact( $( this ) );

})

.on( 'click' , '.group-header .edit, .edit-button' , function(){

  editGroupMode( $( '.chatDom.active' ).data( 'isGroup' ) );

})

.on( 'click' , '.memberDom span' , function(){

  $( this ).parent().find( '.ui-checkbox' ).toggleClass( 'active' );
  $( this ).parent().toggleClass( 'active' );

})

.on( 'click' , '.memberDom .member-avatar' , function(){

  $( this ).parent().find( '.ui-checkbox' ).toggleClass( 'active' );
  $( this ).parent().toggleClass( 'active' );

})

.on( 'click', '.memberDom .ui-checkbox' , function(){

  $( this ).parent().toggleClass( 'active' );

})

.on( 'click' , '.removeGroup' , function(){

  var channel = $( '.chatDom.active' ).data( 'channel' );

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

})

.on( 'click' , '.exitGroup' , function(){

  var channel = $( '.chatDom.active' ).data( 'channel' );

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

})

.on( 'app-param', function( e, params ){

  var interval = setInterval(function(){
    $( '.chatDom-' + params ).click();
    clearInterval(interval);
  }, 1000);

})

.on( 'ui-view-resize ui-view-maximize ui-view-unmaximize', function(){

  $( '.message-container' ).scrollTop(9999999);

})

.on('click','.back-button', function(){
  goBack();
});
// END APP EVENTS

// FUNCTIONS
var setTexts = function(){

  $( '.chat-tab-selector span' ).text(lang.chats);
  $( '.contact-tab-selector span' ).text(lang.contacts);
  msgInput.attr('placeholder', lang.msg);
  $( '.chat-search input' ).attr('placeholder', lang.search);;
  $( '.close-coversation' ).text(lang.close);
  $( '.send-txt' ).text(lang.send);
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
  $( '.app-color .white' ).text(lang.white);
  $( '.app-color .dark' ).text(lang.dark);
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

    mode = 0;
    prevMode = mode;
    contactsButton.removeClass('active');
    chatButton.addClass('active');
    contactTab.removeClass( 'visible' );
    chatTab.addClass( 'visible' );
    newGroupButton.removeClass( 'visible' );
    colorChange.addClass( 'visible' );
    groupMenu.removeClass( 'visible' );
    removeGroup.removeClass( 'visible' );
    $('.new-group').removeClass( 'visible' );

    break;

    // Make it active and visible
    case 'contact':

    mode = 1;
    prevMode = mode;
    chatButton.removeClass( 'active' );
    contactsButton.addClass( 'active' );
    chatTab.removeClass( 'visible' );
    contactTab.addClass( 'visible' );
    newGroupButton.addClass( 'visible' );
    colorChange.removeClass( 'visible' );
    $('.new-group').addClass( 'visible' );

    break;

  }

}

var getContacts = function(){

  var friends   = $.Deferred();
  var connected = $.Deferred();
  var channels  = $.Deferred();

  api.user.friendList( false, function( error, list ){
    friends.resolve( list );
  });

  api.user.connectedFriends( true, function( error, list ){
    connected.resolve( list );
  });

  wql.getSingleChannel( [ myContactID, myContactID ], function( error, list ){

    var res = [];

    asyncEach( list, function( channel, callback ){

      api.channel( channel.id_channel, function( error, chn ){

        chn.user = channel.user;

        res.push( chn );
        callback();

      });

    }, function(){
      channels.resolve( res );
    });

  });

  $.when( friends, connected, channels ).done( function( friends, connected, channels ){

    if ( friends.length === 0 ) {

      $( '.no-content' ).css(
        {
          'width' : '100%',
          'left'   : '0'
        }
      );

      $( '.new-group-button' ).remove();
      searchBox.remove();

      confirm( lang.noContacts , function(o){
        if(o){
          wz.app.removeView( app );
          wz.app.openApp( 2 , function(o){} );
        }
      });

      return;

    }

    asyncEach( friends, function( friend, callback ){

      var channel     = channels.filter( function( item ){ return item.user === friend.id; })[ 0 ];
      var isConnected = connected.filter( function( id ){ return id === friend.id; })[ 0 ];

      // Existe el canal
      if( channel ){

        delete channel.user;
        appendContact( friend , channel , callback );
        updateContactState( $( '.user-id-' + friend.id ) , isConnected , friend.id );

      }
      // No existe el canal
      else{
        appendContact( friend , null , callback );
        updateContactState( $( '.user-id-' + friend.id ) , isConnected , friend.id );
      }

    }, function(){

    });

  });

}

var getChats = function( callback ){

  wz.app.setBadge( 0 );

  wql.getChannels( myContactID , function( error , channels ){

    if ( error ) { console.log('ERROR: ', error ); }

    if( !channels.length ){
      return contactsButton.click();
    }

    $.each( channels , function( i , channel ){

      // No repeat chats already appended
      if ( $( '.chatDom-' + channel.id ).length != 0 ) {
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


            asyncEach( friends , function( element , cb ){

              if ( element.id == you ) {

                api.channel( channel.id , function( error, channel ){

                  appendChat( channel , element , groupName , cb );

                });

              }else{

                cb();

              }

            } , function(){

              if( callback ){
                callback();
              }

            });

          }else{

            api.channel( channel.id , function( error, channel ){

              var usersInGroup = [];

              asyncEach( users , function( user , cb ){

                wz.user( user.user , function( e , user ){

                  if ( user.id != myContactID ) {
                    usersInGroup.push( user );
                  }
                  cb();

                });


              }, function(){

                appendChat( channel , usersInGroup , groupName , function(){

                  if( callback ){
                    callback();
                  }

                });

              });

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

  contact.find( '.contact-img' ).css( 'background-image' , 'url(' + c.avatar.big + ')' );

  contact
  .data( 'contact' , c );
  contact
  .addClass( 'user-id-' + c.id );

  myContacts.push( { id : c.id , status : false , name: c.name } );

  if( channel != undefined ){ contact.data( 'channel' , channel ) }

  contactList.append( $( '.contactDom' ).add( contact ).sort( function( a, b ){

    a = $(a).data('contact');
    b = $(b).data('contact');

    if( isConected( a.id ) === isConected( b.id ) ){
      return a.fullName.localeCompare( b.fullName );
    }

    if( isConected( a.id ) ){
      return -1;
    }

    return 1;

  }) );

  callback();

}

var appendChat = function( c , user , groupName , callback ){

  chatButton.click();

  wql.getMessages( c.id , function( error, messages ){

    messages = messages.reverse();

    wql.getLastRead( [c.id, myContactID] , function( error , lastRead ){

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



        if ( groupName != null ) {

          if(lastMsg != undefined){

            wz.user( lastMsg.sender , function( e , usr ){

              var name = usr.name;
              var date = new Date(lastMsg.time);

              chat.find( '.channel-last-time' ).text( timeElapsed( date ) );

              if ( lastMsg.sender == myContactID ) {

                chat.find( '.channel-last-msg' ).html( '<i>' + lang.you + '</i>' + ': ' + lastMsg.text );

              }else{

                chat.find( '.channel-last-msg' ).html( '<i>' + name + '</i>' + ': ' + lastMsg.text );

              }

            });

          }

          chat.find( '.channel-name' ).text( groupName );

          setGroupAvatar( groupName , chat.find( '.channel-img' ) );

        }else{

          chat.find( '.channel-name' ).text( user.fullName );
          chat.find( '.channel-img' ).css( 'background-image' , 'url(' + user.avatar.big + ')' );

          if(lastMsg != undefined){

            var date = new Date( lastMsg.time );

            chat.find( '.channel-last-time' ).text( timeElapsed( date ) );

            if ( lastMsg.sender == myContactID ) {

              chat.find( '.channel-last-msg' ).html( '<i>' + lang.you + '</i>' + ': ' + lastMsg.text );

            }else {

              chat.find( '.channel-last-msg' ).text( lastMsg.text );

            }

          }

        }

        // No repeat chats already appended
        if ( $( '.chatDom-' + c.id ).length != 0 ) {

          if( callback ){ callback(); };
          return;

        }else{

          if (lastMsg) {
            appendChatInOrder( chat , new Date( lastMsg.time ) );
            chat
            .data( 'time' , new Date( lastMsg.time ) );
          }else{
            appendChatInOrder( chat , new Date() );
            chat
            .data( 'time' , new Date() );
          }

          if ( notSeen[0] != undefined && notSeen[0]['COUNT(*)'] > 0 ) {

            $('.chatDom-' + c.id).data( 'notSeen' , notSeen[0]['COUNT(*)'] );
            $('.chatDom-' + c.id).find( '.channel-badge' ).addClass('visible').find('span').text( notSeen[0]['COUNT(*)'] );
            updateBadge( notSeen[0]['COUNT(*)'] , true );

          }

        }

        chat.data( 'channel' , c );
        chat.data( 'user' , user );
        chat.data( 'isGroup' , groupName );

        setActiveChat( chat );

        if( callback ){ callback(); };

      });

    });

  });

}

var appendChatInOrder = function( chat , time ){

  var chats = $( '.chatDom' );
  var appended = false;

  if ( chats.length == 0 ) {
    channelList.append( chat );
  }

  $.each( chats , function( i , c ){

    var chatInCourse = $(c);
    var timeInCourse = chatInCourse.data( 'time' );

    if( time > timeInCourse && !appended ){
      chatInCourse.before( chat );
      appended = true;
    }

  });

  if ( !appended ) {
    chats.eq( chats.length - 1 ).after( chat );
  }

}

var selectContact = function( contact ){

  if( mode != -1 ){

    groupMenu.removeClass( 'visible' );
    removeGroup.removeClass( 'visible' );

    $( '.conversation-header' ).off( 'click' );

    var channel = contact.data( 'channel' );
    $( '.contactDom.active' ).removeClass( 'active' );
    contact.addClass( 'active' );

    if( !mobile ){

      content.addClass( 'visible' );
      msgInput.focus();

    }else{

      prevMode = mode;
      mode = -1;
      $('.initial-header').transition({
        'x': '-100%'
      },animationDuration);
      $('.conver-header').transition({
        'x': '0'
      },animationDuration);
      $('.conver-avatar').css('background-image', contact.find('.contact-img').css('background-image') );
      content.show().transition({
        'x' : 0
      },animationDuration, function(){
        mode = 2;
        $(this).addClass( 'visible' );
        msgInput.focus();
      });
      $('.ui-navbar').transition({
        'x' : '-100%'
      },animationDuration);

    }

    // Set header
    $( '.conversation-name, .conver-header .conver-title' ).text( contact.find( '.contact-name' ).text() );

    if ( channel == undefined ) {

      $( '.messageDom' ).remove();
      $( '.separatorDom' ).remove();
      $( '.chatDom.active' ).removeClass( 'active' );

    }else{

      $( '.chatDom.active' ).removeClass( 'active' );
      $( '.chatDom-' + channel.id ).addClass( 'active' );
      listMessages( channel );
      changeTab('chat');

    }

    if ( contact.hasClass( 'conected' ) ) {

      lastMessage.addClass( 'conected' );
      lastMessage.text( lang.conected );

    }else{

      lastMessage.removeClass( 'conected' );
      lastMessage.text( lang.disconected );

    }

  }

}

var selectChat = function( chat ){

  if( mode != -1 ){

    groupMenu.removeClass( 'visible' );
    removeGroup.removeClass( 'visible' );
    currentDate = null;

    var channel = chat.data( 'channel' );
    var contact = chat.data( 'user' );

    lastMessage.removeClass( 'conected' );
    $( '.chatDom.active' ).removeClass( 'active' );
    chat.addClass( 'active' );

    if( !mobile ){

      content.addClass( 'visible' );
      msgInput.focus();

    }else{

      prevMode = mode;
      mode = -1;
      $('.initial-header').transition({
        'x': '-100%'
      },animationDuration);
      $('.conver-header').transition({
        'x': '0'
      },animationDuration);
      $('.conver-avatar').css('background-image', chat.find('.channel-img').css('background-image') );
      content.show().transition({
        'x' : 0
      },animationDuration, function(){
        mode = 2;
        $(this).addClass( 'visible' );
        msgInput.focus();
      });
      $('.ui-navbar').transition({
        'x' : '-100%'
      },animationDuration);

    }

    // Set header
    $( '.conversation-name, .conver-header .conver-title' ).text( chat.find( '.channel-name' ).text() );

    if ( channel == undefined ) {

      //$( '.conversation-header' ).data( 'channel' , null );
      $( '.messageDom' ).remove();
      $( '.separatorDom' ).remove();


    }else{

      //$( '.conversation-header' ).data( 'channel' , channel );
      listMessages( channel );

      chat.data( 'notSeen' , null );
      if ( chat.find( '.channel-badge' ).hasClass( 'visible' ) ) {
        updateBadge( parseInt(chat.find( '.channel-badge span' ).text()) , false );
      }
      chat.find( '.channel-badge' ).removeClass( 'visible' );

      $( '.conversation-header' ).off( 'click' );

      if( chat.data( 'isGroup' ) != null ){

        if( mobile ){
          $( '.conver-info' ).addClass( 'viewGroup' );
        }else{
          $( '.conversation-header' ).addClass( 'viewGroup' );
        }

      }else{

        if( mobile ){
          $( '.conver-info' ).removeClass( 'viewGroup' );
        }else{
          $( '.conversation-header' ).removeClass( 'viewGroup' );
        }

      }

      if ( chat.data( 'isGroup' ) == null ) {

        if ( isConected( contact.id ) ) {

          lastMessage.addClass( 'conected' );
          lastMessage.text( lang.conected );

        }else {

          lastMessage.removeClass( 'conected' );
          lastMessage.text( lang.disconected );

        }

      }else{

        lastMessage.text( ( contact.length + 1 ) + ' ' + lang.members );

      }

    }

  }

}

var listMessages = function( channel ){

  $( '.messageDom' ).remove();
  $( '.separatorDom' ).remove();

  var isGroup = false;

  var users = $( '.chatDom.active' ).data( 'user' );

  if ( Array.isArray( users ) ) {

    isGroup = true;

  }

  wql.getMessages( channel.id , function( error, messages ){

    messages = messages.reverse();

    if ( error ) { console.log('ERROR: ', error ); }

    for( var i = 0; i < messages.length; i++ ){

      if ( messages[i].sender == myContactID ) {

        printMessage( messages[ i ] , null , messages[ i ].time );

      }else{

        if ( !isGroup ) {

          printMessage( messages[ i ] , users , messages[ i ].time );

        }else{

          for (var j = 0; j < users.length; j++) {

            if ( users[j].id == messages[ i ].sender ) {

              printMessage( messages[ i ] , users[j] , messages[ i ].time );

            }

          }

        }

      }

    }

    if( messages && messages.length > 0){

      var lastReadId = messages[ messages.length - 1].id;

      wql.updateLastRead( [ lastReadId , channel.id, myContactID ] , function( error , message ){

        if ( error ) { console.log('ERROR: ', error ); }
        $('.chatDom.active').data( 'notSeen' , 0 );


        if ( isGroup ) {

          var aux = 0 ;

          $.each( users , function( i , user ){

            wql.getLastRead( [ channel.id , user.id ] , function( error , lastRead ){

              if ( lastRead[0].last_read > aux ) {

                aux = lastRead[0].last_read;
                var lastMsgRead = $( '.msg-id-' + lastRead[0].last_read);
                var index = lastMsgRead.index() - 1;

                $( '.messageDom' ).removeClass('readed');
                lastMsgRead.parent().find( '.messageDom' ).slice( 0 , index ).addClass( 'readed' );

              }

            });

            channel.send(  { 'action' : 'updateRead' , 'id' : channel.id , 'lastRead' : lastReadId } , function( error ){

            });

          });

        }else {

          wql.getLastRead( [ channel.id , users.id ] , function( error , lastRead ){

            var lastMsgRead = $( '.msg-id-' + lastRead[0].last_read);
            var index = lastMsgRead.index() - 1;

            $( '.messageDom' ).removeClass('readed');
            lastMsgRead.parent().find( '.messageDom' ).slice( 0 , index ).addClass( 'readed' );

          });

          channel.send(  { 'action' : 'updateRead' , 'id' : channel.id , 'lastRead' : lastReadId } , function( error ){

          });

        }

      });

    }

  });

}

var isConected = function( user ){

  var conected = false;

  for (var i = 0; i < myContacts.length; i++) {

    if ( myContacts[i].id == user && myContacts[i].status ) {

      conected = true;

    }

  }

  return conected;

}

var printMessage = function( msg , sender , time , animate , byScroll , checked ){

  var message;
  var date = new Date( time );
  var hh = date.getHours();
  var mm = date.getMinutes();
  var text = msg.text;

  if (!text) { text = msg.txt };

  if ( text ) {

    textProcessed = text.replace( /((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/ig, '<a href="$1" target="_blank">$1</a>' );
    textProcessed = textProcessed.replace(/\n/g, "<br />");

  }else{

    textProcessed = text;

  }

  textProcessed = $('<div></div>').html( textProcessed );

  textProcessed.find('a').each( function(){

    if( !(/^http(s)?:\/\//i).test( $(this).attr('href') ) ){
      $(this).attr( 'href', 'http://' + $(this).attr('href') );
    }

  });

  textProcessed = textProcessed.html();


  if ( text ) {

    textProcessed = text.replace( /((http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/ig, '<a href="$1" target="_blank">$1</a>' );
    textProcessed = textProcessed.replace(/\n/g, "<br />");

  }else{

    textProcessed = text;

  }

  textProcessed = $('<div></div>').html( textProcessed );

  textProcessed.find('a').each( function(){

    if( !(/^http(s)?:\/\//i).test( $(this).attr('href') ) ){
      $(this).attr( 'href', 'http://' + $(this).attr('href') );
    }

  });

  textProcessed = textProcessed.html();


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
    .find( '.message-text' ).html( textProcessed );
    message
    .find( '.message-time' ).text( hh + ':' + mm );

  }else{

    message = $( '.message-other.wz-prototype' ).clone();
    message
    .removeClass( 'wz-prototype' )
    .addClass( 'messageDom' )
    message
    .find( '.message-text' ).html( textProcessed );

    if ( $( '.chatDom.active' ).data( 'isGroup' ) != null ) {

      var senderName = sender.fullName;
      message.addClass( 'sender-group' );
      message.find( '.sender' ).addClass( 'visible' );
      message.find( '.sender' ).text( senderName );
      message.find( '.sender' ).css( 'color' , colors[ selectColor( senderName ) ] );

    }

    message
    .find( '.message-time' ).text( hh + ':' + mm );

    message
    .find( '.message-avatar' ).css( 'background-image' , 'url(' + sender.avatar.big + ')' );

  }

  message.addClass( 'messageDom' ).addClass( 'msg-id-' + msg.id );
  message.data( 'id' , msg.id );
  message.data( 'date' , date );

  if (byScroll) {

    $( '.messageDom' ).eq(0).before( message );

  }else{

    msgContainer.append( message );

  }

  if(animate){
    msgContainer.stop().clearQueue().animate( { scrollTop : message[0].offsetTop }, 400  );
  }else{
    msgContainer.scrollTop( message[0].offsetTop );
  }

  if ( checked ) {
    message.addClass( 'readed' );
  }

  var now = new Date();
  var yesterday = new Date();
  yesterday.setDate( now.getDate() - 1 );

  var separator = separatorPrototype.clone();
  separator.removeClass( 'wz-prototype' ).addClass( 'separatorDom' );

  if ( byScroll && firstLoad ) {
    currentDate = $( '.messageDom' ).eq(0).data( 'date' );
    firstLoad = false;
  }

  //console.log('msg',date);
  if( !byScroll && currentDate && ( date.getDate() > currentDate.getDate() || date.getMonth() > currentDate.getMonth() || date.getFullYear() > currentDate.getFullYear() )){

    if ( currentDate.getFullYear() == yesterday.getFullYear() && currentDate.getMonth() == yesterday.getMonth() && currentDate.getDate() == yesterday.getDate() ) {
      separator.find('span').text('Ayer');
    }else{
      separator.find('span').text(timeElapsed(currentDate));
    }

    message.before( separator );
    //console.log('insertsep before',separator.find('span').text());

  }else if( byScroll && currentDate && ( date.getDate() < currentDate.getDate() || date.getMonth() < currentDate.getMonth() || date.getFullYear() < currentDate.getFullYear() )){

    separator.find('span').text(timeElapsed(currentDate));
    message.before( separator );
    //console.log('insertsep before',separator.find('span').text());

  }

  if ( !byScroll && currentDate && ( date.getFullYear() != now.getFullYear() || date.getMonth() != now.getMonth() || date.getDate() != now.getDate() ) ) {

    var sep = separatorPrototype.clone();
    sep.removeClass( 'wz-prototype' ).addClass( 'separatorDom final-separator' );

    if ( date.getFullYear() == yesterday.getFullYear() && date.getMonth() == yesterday.getMonth() && date.getDate() == yesterday.getDate() ) {
      sep.find('span').text('Ayer');
    }else{
      sep.find('span').text(timeElapsed(currentDate));
    }

    message.after( sep );

  }

  if ( message.prev().hasClass('final-separator') ) {
    message.prev().remove();
  }else if ( message.prev().prev().hasClass('final-separator') ) {
    message.prev().prev().remove();
  }

  currentDate = date;

}

var initChat = function(){

  api.user( myContactID , function( error, user ){

    me = user;

    setTexts();
    checkTab();
    getContacts();
    getChats();

    msgInput.textareaAutoSize();

  });

}

var sendMessage = function(){

  var txt = msgInput.val();
  var channel = $( '.chatDom.active' ).data( 'channel' );
  var channelDom = $( '.chatDom.active' );
  var contactApi = $( '.contactDom.active' ).data( 'contact' );

  // Clean sender
  msgInput.val('');

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
              send( txt , channel , channelDom );
              getChats( function(){

                $( '.chatDom-' + channel.id ).click();

              });

            });

          });

        });

      });

    });

  }else{

    send( txt , channel , channelDom );

  }

}

var send = function( message , channel , channelDom ){

  if( message != '' ){

    wql.addMessage( [ message , myContactID , channel.id ] , function( error , messages ){

      if ( error ) { console.log('ERROR: ', error ); }

      var groupName = $(channelDom).data('isGroup');
      var myName = wz.system.user().name;
      var sender = ( groupName ? ( groupName + ' - ' + myName ) : myName ).trim() + ':\n';

      channel.send(  {

        'action' : 'message' ,
        'txt' : message ,
        'id' : messages.insertId ,
        'groupName' : groupName

      } , { background : sender + message } , function( error ){

        if ( error ) { console.log('ERROR: ', error ); }

      });

    });

  }

}

var timeElapsed = function( lastTime ){

  var now = new Date();
  var last = new Date( lastTime );
  var message;
  var calculated = false;

  if( now.getFullYear() === last.getFullYear() ){

    if( now.getDate() === last.getDate() ){

      message = getStringHour( lastTime );
      calculated = true;

    }else if( new Date ( now.setDate( now.getDate() - 1 ) ).getDate() === last.getDate() ){

      message = lang.lastDay;
      calculated = true;

    }

  }

  if ( !calculated ) {

    var day = last.getDate();
    var month = last.getMonth()+1;

    if(day<10) {
      day='0'+day
    }

    if(month<10) {
      month='0'+month
    }

    message = day + '/' + month + '/' + last.getFullYear().toString().substring( 2 , 4 );
    calculated = true;

  }

  return message;

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

var objectRecieved = function( message , o ){

  var channelActive = $( '.chatDom.active' ).data( 'channel' );

  switch ( o.action ) {

    // USER REMOVED
    case 'userRemoved':

    var active = $( '.chatDom-' + o.id );

    if ( o.userId == myContactID ) {

      if( channelActive && o.id == channelActive.id ) {

        active.remove();
        content.removeClass( 'visible' );

      }else{

        active.remove();
        content.removeClass( 'visible' );

      }
    }

    break;


    // GROUP NAME CHANGE
    case 'nameChange':

    var active = $( '.chatDom-' + o.id );

    if ( o.userId == myContactID ) {

      if( channelActive && o.id == channelActive.id ) {

        active.remove();
        getChats(function(){

          $( '.chatDom-' + o.id ).click();

        });

      }else{

        active.remove();
        getChats();

      }

    }

    break;

    // MESSAGE READED
    case 'updateRead':

    if ( channelActive && message.id == channelActive.id && message.sender != myContactID ) {

      var lastMsgRead = $( '.msg-id-' + o.lastRead );
      var index = lastMsgRead.index();

      lastMsgRead.parent().find( '.messageDom' ).slice( 0 , ++index ).addClass( 'readed' );

    }
    break;

    case 'writing':

    if ( channelActive && message.id == channelActive.id && message.sender != myContactID ) {

      listenWriting();

    }
    break;

    // MESSAGE
    case 'message':

    messageRecieved( message , o , channelActive );

    if ( channelActive && message.id == channelActive.id && message.sender != myContactID && app.parent().hasClass( 'wz-app-focus' ) ) {

      var interval = setInterval(function(){
        channelActive.send(  { 'action' : 'updateRead' , 'id' : message.id , 'lastRead' : o.id } , function( error ){
        });
        clearInterval(interval);
      }, 1000);

    }

    break;

  }

}

var messageRecieved = function( message , o , channelActive ){

  var chat          = $( '.chatDom-' + message.id );
  var date          = Date.now();
  var printed       = false;
  var messageRec    = message;

  // ESTOY EN LA CONV
  if( channelActive && channelActive.id === message.id ){

    // SOY EL EMISOR
    if( message.sender === myContactID ){

      wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){
        if ( error ) { console.log('ERROR: ', error ); }
        printMessage( o , null , date , true );
      });

      var users = chat.data('user');

      if( !Array.isArray( users ) ){

        setChatInfo( chat , o , message.sender , false );

      }else{

        setChatInfo( chat , o , message.sender , true );

      }

      // SOY RECEPTOR
    }else{

      var users = chat.data('user');

      // CANAL SIMPLE
      if( !Array.isArray( users ) ){

        setChatInfo( chat , o , message.sender , false );

        if (!app.parent().hasClass( 'wz-app-focus' )) {

          printMessage( o , users , date , true );

          if ( message.sender != myContactID ) {
            messageNotReaded( messageRec );

            launchBanner( users.fullName , o.txt , users.avatar.tiny , function(){

              $( '.chatDom-' + message.id ).click();
              wz.app.viewToFront( app );

            });

          }

        }else{

          wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){
            if ( error ) { console.log('ERROR: ', error ); }

            printMessage( o , users , date , true );

          });

        }

        // GRUPO
      }else{

        setChatInfo( chat , o , message.sender , true );

        $.each( users , function( i , user ){

          if ( user.id === message.sender ) {

            if (!app.parent().hasClass( 'wz-app-focus' )) {

              printMessage( o , user , date , true );

              if ( message.sender != myContactID ) {
                messageNotReaded( messageRec );

                wz.user( message.sender, function( error, user ){

                  launchBanner( user.fullName , o.txt , user.avatar.tiny , function(){

                    $( '.chatDom-' + message.id ).click();
                    wz.app.viewToFront( app );

                  });

                });

              }

            }else{

              wql.updateLastRead( [ o.id , channelActive.id, myContactID ] , function( error , message ){

                if ( error ) { console.log('ERROR: ', error ); }

                $( '.user-id-' + user.id ).data( 'channel' , channelActive );

                printMessage( o , user , date , true );

              });


            }

          }

        });

      }

    }

  }else{

    if ( message.sender != myContactID ) {
      messageNotReaded( messageRec );

      wz.user( message.sender, function( error, user ){

        launchBanner( user.fullName , o.txt , user.avatar.tiny , function(){

          $( '.chatDom-' + message.id ).click();
          wz.app.viewToFront( app );

        });

      });

    }

    var users = chat.data('user');

    if( !Array.isArray( users ) ){

      setChatInfo( chat , o , message.sender , false );

    }else{

      setChatInfo( chat , o , message.sender , true );

    }

  }

}

var messageNotReaded = function( message ){

  updateBadge( 1 , true );

  var notSeen = $('.chatDom-' + message.id).data( 'notSeen' );
  notSeen = notSeen ? notSeen + 1 : 1;
  $('.chatDom-' + message.id).data( 'notSeen' , notSeen );
  $('.chatDom-' + message.id).find( '.channel-badge' ).addClass('visible').find('span').text( notSeen );

}

var setChatInfo = function( chat , o , user , isGroup ){

  wz.user( user , function( e , usr ){

    var name = usr.name;

    if ( isGroup ) {

      if ( usr.id == myContactID ) {

        chat.find( '.channel-last-msg' ).html( '<i>' + lang.you + '</i>' + ': ' + o.txt );

      }else {

        chat.find( '.channel-last-msg' ).html( '<i>' + name + '</i>' + ': ' + o.txt );

      }

    }else{

      if ( usr.id == myContactID ) {

        chat.find( '.channel-last-msg' ).html( '<i>' + lang.you + '</i>' + ': ' + o.txt );

      }else {

        chat.find( '.channel-last-msg' ).text( o.txt );

      }

    }

    chat.insertBefore( $( '.chatDom' ).eq(0) );
    chat.find( '.channel-last-time' ).text( timeElapsed( new Date() ) );

  });

}

var getStringHour = function( date ){

  var now = new Date();

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
  if( mode != -1 ){

    $( '.group-menu .visible' ).removeClass( 'visible' );
    groupMenu.addClass( 'visible' ).addClass( 'group-new' ).removeClass( 'group-edit' );
    $( '.group-new' ).addClass( 'visible' );
    $( '.group-name-input input' ).val( '' );
    $( '.search-members input' ).val( '' );

    if( mobile ){

      prevMode = mode;
      mode = -1;
      $('.group-menu').transition({
        'x' : 0
      }, animationDuration, function(){
        mode = 4;
      });
      $('.initial-header .new-group').removeClass('visible');
      $('.initial-header .back-button').addClass('visible');
      $('.initial-header .more-button').hide();
      $('.initial-header .accept-button').show();

    }

    setGroupAvatar( '?' , $( '.group-avatar' ) );

    $( '.memberDom' ).remove();
    api.user.friendList( false, function( error, list ){

      $.each( list , function( index , friend ){

        appendMember( friend );

      });

    });

  }


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

    if( adminMode ){
      editGroup();
    }else{
      alert( lang.exitAdmin );
    }

  }else{

    createNewGroup();

  }

}

var editGroup = function(){

  var groupName = $( '.group-name-input input' ).val();
  var members = $( '.memberDom.active' );
  var channel = $( '.chatDom.active' ).data( 'channel' );
  var membersHaveTo = [];

  if ( groupName != '' ) {

    if ( members.length == 0 ) {

      alert( lang.noMemberError );
      return;

    }

    for (var i = 0; i < members.length; i++) {

      contact = members.eq(i).data( 'contact' );
      membersHaveTo.push( contact.id );

    }

    membersHaveTo.push( myContactID );

    var toDelete = [];
    var toAdd = [];
    var aux = arrDiff( groupMembers , membersHaveTo );
    for (var i = 0; i < aux.length; i++) {
      if (groupMembers.indexOf(parseInt(aux[i])) != -1) {
        toDelete.push(aux[i]);
      }else{
        toAdd.push(aux[i]);
      }

    }

    wql.updateChannelName( [ groupName , channel.id ] , function( error , message ){

      if ( error ) { console.log('ERROR: ', error ); }

      asyncEach( toDelete , function( c , cb ){

        wql.deleteUserInChannel( [ channel.id , parseInt(c) ] , function( error , message ){

          if ( error ) { console.log('ERROR: ', error ); }

          channel.send(  { 'action' : 'userRemoved' , 'txt' : groupName , 'id' : channel.id , 'userId' : parseInt(c) } , function( error ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.removeUser( parseInt(c), function( error ){

              if ( error ) { console.log('ERROR: ', error ); }
              cb();

            });

          });

        });

      }, function(){

        if ( toAdd.length === 0 ) {

          groupMenu.removeClass( 'visible' );
          removeGroup.removeClass( 'visible' );
          $('.chatDom.active').remove();
          getChats( function(){

            $( '.chatDom-' + channel.id ).click();

            channel.send(  { 'action' : 'nameChange' , 'txt' : groupName , 'id' : channel.id , 'userId' : myContactID } , function( error ){

              if ( error ) { console.log('ERROR: ', error ); }

            });

          });

        }

        $.each( toAdd , function( i , user ){

          wql.addUserInChannel( [ channel.id , parseInt(user) ] , function( error , message ){

            if ( error ) { console.log('ERROR: ', error ); }

            channel.addUser( parseInt(user) , function(){

              groupMenu.removeClass( 'visible' );
              removeGroup.removeClass( 'visible' );
              $('.chatDom.active').remove();
              getChats( function(){

                $( '.chatDom-' + channel.id ).click();

                channel.send(  { 'action' : 'nameChange' , 'txt' : groupName , 'id' : channel.id , 'userId' : myContactID } , function( error ){

                  if ( error ) { console.log('ERROR: ', error ); }

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
                  getChats( function(){

                    $('.chatDom-'+channel.id).click();

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

var setGroupAvatar = function( groupName , avatar ){

  var expNameWords = groupName.split(' ');

  avatar.html( '<span>' + (expNameWords[0] || ' ')[0].toUpperCase() + (expNameWords[1] || ' ')[0].toUpperCase() + '</span>');

  var colorId = selectColor( groupName );

  avatar.addClass('group').css({
    'background-image'  : 'none',
    'background-color'  : colorPalette[colorId].light,
    'border'            : '2px solid ' + colorPalette[colorId].border,
    'border-style'      : 'solid'
  });
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

  if( mode != -1 ){

    // Make it visible
    $( '.group-menu .visible' ).removeClass( 'visible' );
    groupMenu.addClass( 'visible' ).addClass( 'group-view' );
    $( '.group-view' ).addClass( 'visible' );

    if( mobile ){

      prevMode = mode;
      mode = -1;
      $('.group-menu').transition({
        'x' : 0
      }, animationDuration, function(){
        mode = 3;
      });

      $('.conver-header').transition({
        'x': '-100%'
      },animationDuration);
      $('.info-header').transition({
        'x': '0'
      },animationDuration);

    }

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

        groupMembers = [];
        appendMember( user , admin ).addClass( 'me' );
        groupMembers.push(myContactID);

        $.each( members , function( index , m ){

          appendMember( m , admin );
          groupMembers.push(m.id);

        });

      });

    });

  }

}

var editGroupMode = function( groupName ){

  prevMode = mode;
  mode = 5;

  if( mobile ){

    $('.edit-button').hide();
    $('.accept-button').show();

  }

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

  member.data( 'contact' , user );

  memberList.append( member );

  return member;

}

var chatDeleted = function( info ){

  var chat = $( '.chatDom-' + info.id );

  if ( chat.hasClass( 'active' ) ) {

    content.removeClass( 'visible' );

  }

  chat.remove();

}

var userAdded = function( info , userId ){

  if( info.sender != myContactID && myContactID === userId ){

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
      adminMode = true;
      $('.group-header .edit').addClass('visible');
      removeGroup.addClass( 'removeGroup' );

    }else{

      adminMode = false;
      removeGroup.find( 'span' ).text(lang.exitGroup);
      $('.group-header .edit').removeClass('visible');
      removeGroup.addClass( 'exitGroup' );

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

var arrDiff = function (a1, a2) {

  var a = [], diff = [];

  for (var i = 0; i < a1.length; i++) {
    a[a1[i]] = true;
  }

  for (var i = 0; i < a2.length; i++) {
    if (a[a2[i]]) {
      delete a[a2[i]];
    } else {
      a[a2[i]] = true;
    }
  }

  for (var k in a) {
    diff.push(k);
  }

  return diff;
};

var updateState = function( userId , state ){

  var chats = $( '.chatDom' );

  $.each( chats , function( i , chat ){

    var chatUser = $( chat ).data( 'user' );
    if ( chatUser && chatUser.id == userId && $( chat ).hasClass( 'active' ) ) {

      if ( state ) {
        lastMessage.addClass( 'conected' );
        lastMessage.text( lang.conected );
      }else{
        lastMessage.removeClass( 'conected' );
        lastMessage.text( lang.disconected );
      }

    }

  });

}

var updateBadge = function( num , add ){

  var actualBadge = wz.app.getBadge();

  if ( add ) {
    wz.app.setBadge( parseInt(actualBadge) + num );
  }else{
    wz.app.setBadge( parseInt(actualBadge) - num );
  }


};

var launchBanner = function( name , text , avatar , callback ){

  api.banner()
  .setTitle( name )
  .setText( text )
  .setIcon( avatar)
  // To Do -> .sound( 'marimba' )
  .on( 'click', callback )
  .render()

}

var warnWriting = function(){

  lastMsg = Date.now();
  var channel = $( '.active.chatDom' ).data( 'channel' );

  warnWritingTimeOut = setTimeout(function(){

    if ( ( Date.now() - lastMsg ) > 500  ) {

      channel.send(  { 'action' : 'writing' , 'id' : channel.id } , function( error ){});

    }

    warnWritingTimeOut = false;

  }, 500);

}

var listenWriting = function(){

  lastMessage.text( lang.writing );

  clearTimeout( listenWritingTimeOut );

  listenWritingTimeOut = setTimeout(function(){

    lastMessage.text( lang.conected );

  }, 1000);

}

var loadMoreMsgs = function(){

  if (loadingMsgs) {
    return;
  }

  loadingMsgs = true;
  firstLoad = true;

  var firstMsg = $( '.messageDom' ).eq(0);
  var channel = $( '.active.chatDom' ).data( 'channel' );
  var users = $( '.active.chatDom' ).data( 'user' );

  wql.getMessagesFrom( [ channel.id , firstMsg.data( 'id' ) ] , function( error , messages ){

    $.each( messages , function( i, msg ){

      if( msg.sender === myContactID ){

        var user = null;

      }else if ( Array.isArray( users ) ) {

        var user = users.find(function( u ){
          return u.id === msg.sender;
        });

      }else{
        var user = users;
      }

      printMessage( msg , user , msg.time , false , true , true );

    });

    if ( firstMsg[0] && messages.length > 0) {
      msgContainer.scrollTop( firstMsg[0].offsetTop - 4 );
    }

    loadingMsgs = false;


  });

}

var goBack = function(){

  if( mobile && mode != -1 ){

    if( mode == 3 || mode == 4 ){

      if( mode == 4 ){

        $('.initial-header .new-group').addClass('visible');
        $('.initial-header .back-button').removeClass('visible');
        $('.initial-header .more-button').show();
        $('.initial-header .accept-button').hide();

      }else{

        $('.conver-header').transition({
          'x': '0'
        },animationDuration);
        $('.info-header').transition({
          'x': '100%'
        },animationDuration);

      }

      mode = -1;
      $('.group-menu').transition({
        'x' : '100%'
      }, animationDuration, function(){

        mode = prevMode;
        groupMenu.removeClass( 'visible' );
        removeGroup.removeClass( 'visible' );

      });

    }else if( mode == 2 ){

      mode = -1;
      $('.initial-header').transition({
        'x': '0'
      },animationDuration);
      $('.conver-header').transition({
        'x': '100%'
      },animationDuration);

      $( '.contactDom.active' ).removeClass( 'active' );
      $( '.chatDom.active' ).removeClass( 'active' );
      $('.ui-navbar').transition({
        'x' : 0
      },animationDuration);
      content.stop().clearQueue().transition({
        'x' : '100%'
      },animationDuration, function(){

        mode = prevMode;
        $(this).hide().removeClass( 'visible' );

      });

    }else if( mode == 5 ){

      mode = -1;
      $('.group-menu').transition({
        'x' : '100%'
      }, animationDuration, function(){

        mode = 2;
        $('.accept-button').hide();
        $('.edit-button').show();
        cancelNewGroup.click();

      });

      $('.conver-header').transition({
        'x': '0'
      },animationDuration);
      $('.info-header').transition({
        'x': '100%'
      },animationDuration);

    }

  }

}

// INIT Chat
initChat();
