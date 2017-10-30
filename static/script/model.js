var model = ( function( view ){

	var async = {

	  each : function( list, step, callback ){

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

	  },

	  parallel : function( fns, callback ){

	    var list     = Object.keys( fns )
	    var position = 0;
	    var closed   = false;
	    var res      = {}
	    var checkEnd = function( i, error, value ){

	      if( closed ){
	        return;
	      }

	      res[ i ] = value
	      position++;

	      if( position === list.length || error ){

	        closed = true;

	        callback( error, res );

	        // Nullify
	        list = callback = position = checkEnd = closed = null;

	      }

	    };

	    if( !list.length ){
	      return callback();
	    }

	    list.forEach( function( fn ){
	      fns[ fn ]( checkEnd.bind( null, fn ) );
	    });

	  }

	}

  class Model{

  	constructor( view ){

  		this.view = view;
  	  this.openedChat
		  this.contacts = {}
		  this.conversations = {}
		  this._mainAreaMode
		  this._prevMainAreaMode = MAINAREA_NULL
  		this._sidebarMode

		  this.changeMainAreaMode( MAINAREA_NULL )
		  this.changeSidebarMode( SIDEBAR_NULL )
  		this.fullLoad();

  	}

  	_loadFullContactList( callback ){

  		callback = api.tool.secureCallback( callback )

		  async.parallel({

		    contacts : function( callback ){
		      api.user.friendList( false, callback )
		    },

		    connected : function( callback ){
		      api.user.connectedFriends( true, callback )
		    }

		  }, function( err, res ){

		    // To Do -> Error

		    this.contacts = {}

		    res.contacts.forEach( function( user ){
		      this.addContact( user )
		    }.bind( this ))

		    res.connected.forEach( function( userId ){
		      this.setContactConnection( userId, true )
		    }.bind( this ))

		    this._updateAllConversationsUI()
		    callback( null, res )

		  }.bind( this ))

  	};

  	_loadFullConversationsList( callback ){

		  callback = api.tool.secureCallback( callback )

		  api.com.list({ protocol : 'chat' }, function( err, contexts ){

		    // To Do -> Error

		    contexts.forEach( function( context ){
		      this.addConversation( context )
		    }.bind( this ))

		    callback( null, contexts )

		  }.bind( this ) )

		}

		_updateAllConversationsUI(){

		  for( var i in this.conversations ){
		    this.conversations[ i ].updateUI()
		  }

		}

		addConversation( context ){

		  if( this.conversations[ context.id ] ){
		    return this
		  }

		  this.conversations[ context.id ] = new Conversation( this, context )

		  this.updateConversationsListUI()

		  return this

		}

		addContact( user ){

		  if( this.contacts[ user.id ] ){
		    return this
		  }

		  this.contacts[ user.id ] = new Contact( this, user )

		  this.updateContactsListUI()

		  return this

		}

		appendMessage( message ){

			var senderName = null;
			var senderAvatar = null;

		  if( !this.openedChat || this.openedChat.context.id !== message.context ){
		    return
		  }

		  if( this.conversations[ message.context ].isGroup ){

		    senderName = this.contacts[ message.sender ].user.fullName

		  }

		  if( message.sender !== api.system.user().id ){
				senderAvatar = this.contacts[ message.sender ].user.avatar.big
			}

		  view.appendMessage( message, senderName, senderAvatar );

		}

		changeMainAreaMode( value, list ){

		  if( this._mainAreaMode === value ){
		    return
		  }

		  this._prevMainAreaMode = this._mainAreaMode
		  this._mainAreaMode = value

			view.changeMainAreaMode( value, list );

		}

		changeSidebarMode( value ){

		  if( this._sidebarMode === value ){
		    return
		  }

		  this._sidebarMode = value

		  view.changeSidebarMode( value )

		}

		ensureConversation( contextId, callback ){

		  if( this.conversations[ contextId ] ){
		    return callback()
		  }

		  api.com.get( contextId, function( err, event ){

		  	if( err ){
		  		return callback(err);
		  	}

		    this.addConversation( event.context )
		    callback();

		  }.bind(this))

		}

		filterElements( filter, groupSearch ){

		  if( groupSearch ){
		  	view.filterContacts( filter, groupSearch );
		  }else if( this._sidebarMode === SIDEBAR_CONVERSATIONS ){
		  	view.filterChats( filter )
		  }else if( this._sidebarMode === SIDEBAR_CONTACTS ){
		  	view.filterContacts( filter, false )
		  }

		}

		fullLoad(){

		  // To Do -> Remove timeout

		  async.parallel({

		    contacts : this._loadFullContactList.bind(this),
		    conversations : this._loadFullConversationsList.bind(this)

		  }, function( err, res ){

		    if( err ){
		    	return console.log( err );
		    }

		    if( this._sidebarMode !== SIDEBAR_NULL ){
		      return
		    }
		    if( res.conversations.length ){
		      this.changeSidebarMode( SIDEBAR_CONVERSATIONS )
		    }else if( res.contacts.contacts.length ){
		      this.changeSidebarMode( SIDEBAR_CONTACTS )
		    }else{
		      // To Do -> Show forever alone
		    }

		  }.bind(this))

		  return this;

		}

		handleMessage( message ){

			this.conversations[ message.context ].updateLastMessage( message )
      this.appendMessage( message )

		}

		hideGroupMenu(){
			view.hideGroupMenu();
		}

		openConversation( conversationId ){

			var conversation;
			if( typeof conversationId == 'number' ){
				conversation = this.conversations[ conversationId ];
			}else{
				conversation = conversationId;
			}
			
			var isConnected = this.contacts[ conversation.users[ 0 ] ] && this.contacts[ conversation.users[ 0 ] ].connected;

		  this.changeSidebarMode( SIDEBAR_CONVERSATIONS )

		  if( this.openedChat && conversation.context.id === this.openedChat.context.id ){
		    return this
		  }

		  if( this.openedChat ){
		    this.openedChat.setOpened( false )
		  }

		  this.openedChat = conversation.setOpened( true )

		  this.changeMainAreaMode( MAINAREA_CONVERSATION )

		  view.openConversation( conversation, isConnected );

		  conversation.context.getMessages( { withAttendedStatus : true }, function( err, list ){

		    // To Do -> Error
		    list.forEach( function( message ){
		      this.appendMessage( message )
		    }.bind(this))

		  }.bind(this))

		  return this

		}

		openConversationWithContact( contactId ){

			var contact = this.contacts[ contactId ];

		  var conversation;

		  for( var i in this.conversations ){

		    if( this.conversations[ i ].isGroup ){
		      continue
		    }

		    if( this.conversations[ i ].users[ 0 ] === contact.user.id ){
		      conversation = this.conversations[ i ]
		      break
		    }

		  }

		  if( conversation ){
		    return this.openConversation( conversation )
		  }

		  var context = new FakeContext( contact.user.id )

		  this.addConversation( context )
		  this.openConversation( this.conversations[ context.id ] )

		  return this

		}

		sendBuffer( value ){

			if( this.openedChat && value ){
				this.openedChat.sendBuffer( value );
			}

		}

		setContactConnection( id, connected ){

		  if( this.contacts[ id ] ){
		    this.contacts[ id ].setConnection( connected )
		  }

		  return this

		}

		startCreateGroup(){

			if( this._mainAreaMode === MAINAREA_GROUPMODE ){
				return;
			}

		  var list = []

		  for( var i in this.contacts ){
		    list.push( this.contacts[ i ] )
		  }

			this.changeMainAreaMode( MAINAREA_GROUPMODE, list );

			//view.startCreateGroup( list );

	    /*if( mobile ){

	      prevMode = mode;
	      mode = MODE_ANIMATING;
	      $('.group-menu').transition({
	        'x' : 0
	      }, animationDuration, animationEffect, function(){
	        mode = MODE_CREATING_GROUP;
	      });
	      $('.initial-header .new-group').removeClass('visible');
	      $('.initial-header .back-button').addClass('visible');
	      //$('.initial-header .more-button').hide();
	      $('.initial-header .accept-button').show();

	    }*/

		}

		updateContactsListUI(){

		  var list = []

		  for( var i in this.contacts ){
		    list.push( this.contacts[ i ] )
		  }

		  this.view.updateContactsListUI( list );
		
		}

		updateConversationId( oldId, newId ){

		  this.conversations[ newId ] = this.conversations[ oldId ]
		  delete this.conversations[ oldId ]
		  this.updateConversationsListUI()

		  return this;

		}

		updateConversationsListUI(){

		  var list = []

		  for( var i in this.conversations ){
		    list.push( this.conversations[ i ] )
		  }

			this.view.updateConversationsListUI( list );

		}

		updateMessageAttendedUI( messageId, contextId ){

		  if( !this.openedChat || this.openedChat.context.id !== contextId ){
		    return
		  }

		  view.markMessageAsRead( messageId );

		}

  }

  class Contact{

  	constructor( app, user ){

  		this.app = app;
  		this.user = user;
  		this.connected = false;

  	}

  	setConnection( value ){

  		this.connected = !!value
		  this.app.updateContactsListUI()

		  return this;

  	}

  }

  class Conversation{

  	constructor( app, context ){

  		this.app = app;
		  this.context = context
		  this.users = []
		  this.world
		  this.lastMessage
		  this.opened = false
		  this.isGroup = false // To Do
		  this.name // To Do -> Default value
		  this.img;

		  // Set UI
		  this._loadAdditionalInfo()
		  this.updateUI()

  	}

  	_loadAdditionalInfo(){

  		//TODO paralelizar y al acabar actualizar la UI
		  this.context.getUsers( { full : false }, function( err, list ){

		    this.users = api.tool.arrayDifference( list, [ api.system.user().id ] )
		    this.updateUI();

		  }.bind( this ))

		  this.context.getMessages( { withAttendedStatus : true }, function( err, list ){ // To Do -> Limit to the last one

		    this.updateLastMessage( list[ list.length - 1 ] );

		  }.bind( this ))

		}

		_upgradeToRealConversation( callback ){

		  if( !( this.context instanceof FakeContext ) ){
		    return callback()
		  }

		  this.context.getUsers( function( err, users ){

		    api.com.create( { protocol : 'chat', users : users }, function( err, context ){

		      // To Do -> Err

		      var oldId = this.context.id

		      this.context = context
		      this.app.updateConversationId( oldId, context.id )
		      callback()

		    }.bind( this ))

		  }.bind( this ))

		}

		sendBuffer( value ){

		  if( !value ){
		    return
		  }

		  this._upgradeToRealConversation( function(){

		  	view.clearInput();
		    this.context.send( { data : { action : 'message', text : value }, persistency : true, notify : value }, function( err ){

		      // To Do -> Error
		      if( err ){
		      	return
		      }

		      //updateLastMessage( this)

		    })

		  }.bind( this ))

		  return this;

		}

		setOpened( value ){

		  this.opened = !!value
		  view.conversationSetOpened( this.context.id, this.opened );

		  return this;

		}

		updateLastMessage( message ){

		  this.lastMessage = message
		  view.updateConversationUI( this );

		}

		updateUI(){

		  var img

		  if( this.context.name ){
		    this.name = this.context.name
		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    this.name = this.app.contacts[ this.users[ 0 ] ].user.fullName
		  }else{
		    // To Do -> lang.unknown
		  }

		  if( this.world ){
		    this.img = this.world.icon.big // To Do -> Mirar si es el tamaño adecuado
		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    this.img = this.app.contacts[ this.users[ 0 ] ].user.avatar.big // To Do -> Mirar si es el tamaño adecuado
		  }else{
		    // To Do -> Unknown
		  }

		  //TODO llamar a la view
		  view.updateConversationUI( this );

		}

  }

  class FakeContext{

  	constructor( userId ){

		  this.id = --FakeContext.idCounter
		  this._users = [ userId ]

  	}

  	getUsers( options, callback ){

		  if( arguments.length === 1 ){
		    callback = options
		    options  = {}
		  }

		  if( !options.full ){
		    return callback( null, this._users )
		  }

		  async.map( this._users, function( userId, callback ){
		    // To Do
		  }, callback )

		};

		getMessages( options, callback ){

		  if( arguments.length === 1 ){
		    callback = options
		    options = {}
		  }

		  callback( null, [] )

		}

  }

  FakeContext.idCounter = 0

  return new Model( view )

})( view )
