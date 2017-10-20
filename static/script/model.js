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

  	}

		_changeSidebarMode( value ){

		  if( this._sidebarMode === value ){
		    return
		  }

		  this._sidebarMode = value

		  view.changeSidebarMode( value )

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

		    //this._updateAllConversationsUI()
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

		addConversation( context ){

		  if( this.conversations[ context.id ] ){
		    return this
		  }

		  this.conversations[ context.id ] = new Conversation( this, context )

		  //this._updateConversationsListUI()

		  return this

		}

		addContact( user ){

		  if( this.contacts[ user.id ] ){
		    return this
		  }

		  this.contacts[ user.id ] = new Contact( this, user )

		  //this.updateContactsListUI()

		  return this

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

		    console.log(this);
		    if( this._sidebarMode !== this.SIDEBAR_NULL ){
		      return
		    }if( res.conversations.length ){
		      this._changeSidebarMode( this.SIDEBAR_CONVERSATIONS )
		    }else if( res.contacts.contacts.length ){
		      this._changeSidebarMode( this.SIDEBAR_CONTACTS )
		    }else{
		      // To Do -> Show forever alone
		    }

		  }.bind(this))

		}

		setContactConnection( id, connected ){

		  if( this.contacts[ id ] ){
		    this.contacts[ id ].setConnection( connected )
		  }

		  return this

		}

		updateContactsListUI(){

		  var list = []

		  for( var i in this.contacts ){
		    list.push( this.contacts[ i ] )
		  }

		  this.view.updateContactsListUI( list );
		
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
		  //TODO Actualizar lista
		  this.app.updateContactsListUI()

  	}

  }

  class Conversation{

  	constructor( app, context ){

		  this.context = context
		  this.users = []
		  this.world
		  this.lastMessage
		  this.opened = false
		  this.isGroup = false // To Do
		  this.name // To Do -> Default value

		  // Set UI
		  //this._loadAdditionalInfo()
		  //this.updateUI()

  	}

  	/*_loadAdditionalInfo(){

		  this.context.getUsers( { full : false }, function( err, list ){

		    this.users = api.tool.arrayDifference( list, [ api.system.user().id ] )

		  }.bind( this ))

		  this.context.getMessages( { withAttendedStatus : true }, function( err, list ){ // To Do -> Limit to the last one
		    this.updateLastMessage( list[ list.length - 1 ] )
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

		sendBuffer(){

		  var value = $.trim( this.app.dom.find('.conversation-input textarea').val() )

		  if( !value ){
		    return
		  }

		  this._upgradeToRealConversation( function(){

		    //this.app.dom.find('.conversation-input textarea').val('')
		    this.context.send( { data : { action : 'message', text : value }, persistency : true, notify : value }, function( err ){
		      // To Do -> Error
		    })

		  }.bind( this ))

		}

		setOpened( value ){

		  this.opened = !!value

		  return this

		}

		updateLastMessage( message ){

		  this.lastMessage = message

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
		    img = this.world.icon.big // To Do -> Mirar si es el tamaño adecuado
		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    img = this.app.contacts[ this.users[ 0 ] ].user.avatar.big // To Do -> Mirar si es el tamaño adecuado
		  }else{
		    // To Do -> Unknown
		  }

		  //TODO llamar a la view
		  view.updateConversationUI();
		  //this.dom.attr( 'data-id', this.context.id )
		  //this.dom.find('.channel-name').text( this.name );
		  //this.dom.find('.channel-img').css( 'background-image' , 'url(' + img + ')' )
		  //this.dom.find('.channel-last-msg').text( this.lastMessage ? this.lastMessage.data.text : '' )

		}*/

  }

  class FakeContext{

  	constructor( userId ){

		  this.id = --FakeContext.idCounter
		  this._users = [ userId ]

  	}

  	/*getUsers( options, callback ){

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

		}*/

  }

  return new Model( view )

})( view )
