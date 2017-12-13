var model = ( function( view ){

	var async = {

	  each : function( list, step, callback ){

	    var position = 0
	    var closed   = false
	    var checkEnd = function( error ){

	      if( closed ){
	        return
	      }

	      position++

	      if( position === list.length || error ){

	        closed = true

	        callback( error )

	        // Nullify
	        list = step = callback = position = checkEnd = closed = null

	      }

	    }

	    if( !list.length ){
	      return callback()
	    }

	    list.forEach( function( item ){
	      step( item, checkEnd )
	    })

	  },

	  parallel : function( fns, callback ){

	    var list     = Object.keys( fns )
	    var position = 0
	    var closed   = false
	    var res      = {}
	    var checkEnd = function( i, error, value ){

	      if( closed ){
	        return
	      }

	      res[ i ] = value
	      position++

	      if( position === list.length || error ){

	        closed = true

	        callback( error, res )

	        // Nullify
	        list = callback = position = checkEnd = closed = null

	      }

	    }

	    if( !list.length ){
	      return callback()
	    }

	    list.forEach( function( fn ){
	      fns[ fn ]( checkEnd.bind( null, fn ) )
	    })

	  }

	}

  class Model{

  	constructor( view ){

  		this.view = view
  	  this.openedChat
		  this.contacts = {}
		  this.conversations = {}
		  this._mainAreaMode
		  this._prevMainAreaMode = MAINAREA_NULL
  		this._sidebarMode
  		this._groupMode = GROUP_NULL

  		this.unread
  		this.isMobile = this.view.dom.hasClass( 'wz-mobile-view' );

		  this.changeMainAreaMode( MAINAREA_NULL )
		  this.changeSidebarMode( SIDEBAR_NULL )
		  this.reloadUnread()
  		this.fullLoad()

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

  	}

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

		  //Si me añaden a una conversacion y no tenia ninguna
		  if( Object.keys( this.conversations ).length == 1 && ( this._sidebarMode == SIDEBAR_CONTACTS || this._sidebarMode == SIDEBAR_NULL ) ){
		  	this.changeSidebarMode( SIDEBAR_CONVERSATIONS )
		  }

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

		appendMessage( message, loadingList ){

			var senderName = null
			var senderAvatar = null
			//console.log( message );

		  if( !this.openedChat || this.openedChat.context.id !== message.context ){
		    return
		  }

		  if( message.sender !== api.system.user().id ){

		  	if( message.attended.length === 0 && message.attended.indexOf( api.system.user().id ) === -1 && this.view.dom.parent().hasClass( 'wz-app-focus' ) ){
					message.markAsAttended( { full: true }, console.log.bind( console ) )
		  	}

		  	if( this.contacts[ message.sender ] ){

		  		senderAvatar = this.contacts[ message.sender ].user.avatar.big

					if( this.conversations[ message.context ].isGroup || this.conversations[ message.context ].world ){
			    	senderName = this.contacts[ message.sender ].user.fullName
			  	}

		  	}else if( this.conversations[ message.context ].moreUsers[ message.sender ] ){

		  		senderAvatar = this.conversations[ message.context ].moreUsers[ message.sender ].user.avatar.big

					if( this.conversations[ message.context ].isGroup || this.conversations[ message.context ].world ){
			    	senderName = this.conversations[ message.context ].moreUsers[ message.sender ].user.fullName
			  	}

		  	}else{

		  		this.conversations[ message.context ].addNewUser( message.sender );

		  	}


			}else{
				senderName = api.system.user().fullName
			}

			message.senderName = senderName;
			message.senderAvatar = senderAvatar;

			if( loadingList ){
				return message
			}else{
				view.appendMessage( message )
			}

		}

		appendMessageList( list ){

			/*for( var i = 300; i < list.length; i++ ){
				list[i] = this.appendMessage( list[i], true );
			}*/

			for( var i = 0; i < list.length; i++ ){
				list[i] = this.appendMessage( list[i], true );
			}

			view.appendMessageList( list );

		}

		changeMainAreaMode( value, list, conversation ){

		  if( this._mainAreaMode === value ){
		    return
		  }

		  this._prevMainAreaMode = this._mainAreaMode
		  this._mainAreaMode = value

			view.changeMainAreaMode( value, list, conversation )

		}

		changeSidebarMode( value ){

		  if( this._sidebarMode === value ){
		    return
		  }

		  this._sidebarMode = value
		  view.changeSidebarMode( value )

		}

		changeGroupMode( value ){

			if( this._groupMode === value ){
		    return
		  }

		  this._groupMode = value

		}

		deleteConversationFront( conversationId ){

			if( this.openedChat && conversationId === this.openedChat.context.id ){
				this.changeMainAreaMode( MAINAREA_NULL )
			}

			delete this.conversations[ conversationId ]
			this.updateConversationsListUI()

		}

		deleteConversationApi( conversationId ){

			if( !this.conversations[ conversationId ] ){
				return;
			}else{

				if( this.conversations[ conversationId ].world ){
					return view.launchAlert( 'Can not remove world chat' )
				}else if( this.conversations[ conversationId ].context instanceof FakeContext ){
		    	return this.deleteConversationFront( conversationId )
		  	}

			}

			this.conversations[ conversationId ].context.remove( function( err ){

				if( err ){
					return view.launchAlert( err )
				}

			})

		}

		editGroup( conversationId ){

		  var list = []

		  for( var i in this.contacts ){
		    list.push( this.contacts[ i ] )
		  }

			if( conversationId ){

				if( this.conversations[ conversationId ] && this.conversations[ conversationId ].isGroup 
					&& !this.conversations[ conversationId ].world
					&& this.conversations[ conversationId ].admins 
					&& this.conversations[ conversationId ].admins.indexOf( api.system.user().id ) !== -1 ){

					this.changeMainAreaMode( MAINAREA_GROUPMODE, list, this.conversations[ conversationId ] )
					this.changeGroupMode( GROUP_EDIT )

				}

			}else{

				this.changeMainAreaMode( MAINAREA_GROUPMODE, list )
				this.changeGroupMode( GROUP_CREATE )

			}

		}

		ensureConversation( contextId, callback ){

			callback = api.tool.secureCallback( callback )

		  if( this.conversations[ contextId ] ){
		    return callback()
		  }

		  api.com.get( contextId, function( err, event ){

		  	if( err ){
		  		return callback(err)
		  	}

		    this.addConversation( event )
		    callback()

		  }.bind(this))

		}

		filterElements( filter, groupSearch ){

		  if( groupSearch ){
		  	view.filterContacts( filter, groupSearch )
		  }else if( this._sidebarMode === SIDEBAR_CONVERSATIONS ){
		  	view.filterChats( filter )
		  }else if( this._sidebarMode === SIDEBAR_CONTACTS ){
		  	view.filterContacts( filter, false )
		  }

		}

		fullLoad(){

		  async.parallel({

		    contacts : this._loadFullContactList.bind(this),
		    conversations : this._loadFullConversationsList.bind(this)

		  }, function( err, res ){

		    if( err ){
		    	return console.log( err )
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

		  return this

		}

		goBack(){

			if( this.isMobile ){
				this.changeMainAreaMode( this._prevMainAreaMode, this._mainAreaMode );
			}

		}

		handleMessage( message ){

			this.conversations[ message.context ].updateLastMessage( message )
      this.appendMessage( message )

		}

		hideGroupMenu(){

			this.changeGroupMode( GROUP_NULL )
			this.changeMainAreaMode( this._prevMainAreaMode )
			view.hideGroupMenu()

		}

		handleNewNotification( notification ){

			this.updateConversationUnread( notification.comContext )

			if( notification.sender !== api.system.user().id ){

				api.user( notification.sender, function( error, user ){

					if( error ){
						return this.view.launchAlert( error );
					}

	        this.view.launchBanner( user.fullName , notification.message , user.avatar.tiny , function(){

	          api.app.viewToFront( this.view.dom );
	          this.openConversation( notification.comContext );

	        }.bind(this));

	      }.bind(this));

			}

		}

		leaveConversation( groupId ){

			if( !this.conversations[ groupId ] ){
				return view.launchAlert( 'Grupo no existe' )
			}

			this.conversations[ groupId ].context.removeUser( api.system.user().id, function( err ){

				if( err ){
					return view.launchAlert( err )
				}

			})

		}

		markConversationAsAttended( conversationId ){

			if( !this.unread || !(conversationId == null && this.openedChat && this.openedChat.context) ){
				return;
			}

			conversationId = this.openedChat.context.id;

			api.notification.markAsAttended( 'chat', { comContext : conversationId, full: true, previous: true }, function( err ){

		  	if( err ){
		  		view.launchAlert( err )
		  	}

			})

		}

		openConversation( conversationId ){

			var conversation
			if( typeof conversationId == 'number' ){
				conversation = this.conversations[ conversationId ]
			}else{
				conversation = conversationId
			}

			console.log( conversation );

		  if( this.openedChat && conversation.context.id === this.openedChat.context.id ){
		    return this
		  }

		  var isConnected = this.contacts[ conversation.users[ 0 ] ] && this.contacts[ conversation.users[ 0 ] ].connected
		  this.changeSidebarMode( SIDEBAR_CONVERSATIONS )

		  if( this.openedChat ){
		    this.openedChat.setOpened( false )
		  }

		  this.openedChat = conversation.setOpened( true )
		  this.changeMainAreaMode( MAINAREA_CONVERSATION )
		  this.view.openConversation( conversation, isConnected )
		  this.markConversationAsAttended( conversation.context.id );

		  //TODO pedir 500 mensajes y además saber si hay más o no

	  	conversation.context.getMessages( { withAttendedStatus : true }, function( err, list ){

	  		if( err ){
	  			return this.view.launchAlert( err );
	  		}

	  		this.appendMessageList( list );

	  		//this.appendMessageList( list.slice( list.length - 350 , list.length ) );

		    /*list.forEach( function( message ){
		      this.appendMessage( message )
		    }.bind(this))*/

		  }.bind(this))

		  return this

		}

		openConversationWithContact( contactId ){

			var contact = this.contacts[ contactId ]

		  var conversation

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

		reloadUnread(){

			api.notification.count( 'chat', {}, function( err, counter ){

		  	if( err ){
		  		return
		  	}

		  	this.unread = counter

		  }.bind( this ))

		}

		saveGroup( info ){

			if( info.name === '' ){
				return this.view.launchAlert( 'Wrong name' )
			}

			var list = []

		  info.members.each( function(){
		    list.push( parseInt( $(this).attr( 'data-id' ) ) )
		  })

		  info.members = list

		  if( this._groupMode == GROUP_EDIT && info.conversationId ){

				if( this.conversations[ info.conversationId ] && this.conversations[ info.conversationId ].isGroup 
					&& !this.conversations[ info.conversationId ].world
					&& this.conversations[ info.conversationId ].admins 
					&& this.conversations[ info.conversationId ].admins.indexOf( api.system.user().id ) !== -1 ){

					this.conversations[ info.conversationId ].editConversation( info )

				}		  	

		  }else if( this._groupMode == GROUP_CREATE ){
		  	new Conversation( this, null, info )
		  }

		}

		sendBuffer( value ){

			if( this.openedChat && value ){
				this.openedChat.sendBuffer( value )
			}

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

		  this.view.updateContactsListUI( list )
		
		}

		updateConversationId( oldId, newId ){

		  this.conversations[ newId ] = this.conversations[ oldId ]
		  delete this.conversations[ oldId ]
		  this.updateConversationsListUI()

		  return this

		}

		updateConversationInfo( conversationId ){

			if( this.conversations[ conversationId ] ){
				this.conversations[ conversationId ]._loadAdditionalInfo()
			}

		}

		updateConversationUnread( conversationId ){

			var converId = parseInt(conversationId)

			if( this.conversations[ converId ] ){
				this.conversations[ converId ]._loadUnread()
			}

		}

		updateConversationsListUI(){

		  var list = []
		  var id = null

		  for( var i in this.conversations ){
		    list.push( this.conversations[ i ] )
		  }

		  if( this.openedChat && this.openedChat.context.id ){
		  	id = this.openedChat.context.id
		  }

			this.view.updateConversationsListUI( list, id )

		}

		updateMessageAttendedUI( messageId, contextId ){

		  if( !this.openedChat || this.openedChat.context.id !== contextId ){
		    return
		  }

		  this.view.markMessageAsRead( messageId )

		}

  }

  class Contact{

  	constructor( app, user ){

  		this.app = app
  		this.user = user
  		this.connected = false

  	}

  	setConnection( value ){

  		this.connected = !!value
		  this.app.updateContactsListUI()

		  return this

  	}

  }

  class Conversation{

  	constructor( app, context, info ){

  		this.app = app
		  this.context = context
		  this.world
		  this.lastMessage
		  this.opened = false
		  this.admins = [];
		  this.isGroup = false // To Do
		 	this.name = ''
		  this.users = []
		  this.moreUsers = [] //Usuarios que no son contactos

		  if( info ){

		  	this.isGroup = true
		  	this.name = info.name || ''
		  	this.users = info.members || []

		  }else if( this.context ){

		  	if( this.context.name ){

		  		this.isGroup = true
		  		this.name = this.context.name

		  	}

		  	if( this.context.worldId ){
		  		this.world = this.context.worldId
		  	}

		  }

		  this.img
		  this.unread

		  this._startConversation()

  	}

  	_loadAdditionalInfo(){

  		this._loadUsers()
  		this._loadLastMessage()
  		this._loadUnread()

		}

  	_loadLastMessage(){

		  this.context.getMessages( { withAttendedStatus : true, limit : 1, order : 'newFirst' }, function( err, list ){ // To Do -> Limit to the last one

		  	if( err ){
		  		return this.app.view.launchAlert( err )
		  	}
		    this.updateLastMessage( list[0] )

		  }.bind( this ))

  	}

  	_loadUnread(){

  		api.notification.count( 'chat', { comContext : this.context.id }, function( err, counter ){

		  	if( err ){
		  		return this.app.view.launchAlert( err )
		  	}
		  	this.unread = counter
		  	this.updateUI()

		  }.bind( this ))

  	}

   	_loadUsers(){

  		this.context.getUsers( { full : false }, function( err, list, admins ){

		  	if( err ){
		  		return this.app.view.launchAlert( err )
		  	}

		  	//console.log( list, admins )
		    this.users = api.tool.arrayDifference( list, [ api.system.user().id ] )
		    this.admins = admins;
		    this.updateUI()

		  }.bind( this ))

  	}

		_startConversation(){


			if( this.context ){

				this._loadAdditionalInfo()
				this.updateUI()

			}else{

		    api.com.create( 
		    { 
		    	protocol : 'chat', 
		    	name: this.name, 
		    	users : this.users 
		    }, function( err, context ){

		    	if( err ){
		    		return this.app.view.launchAlert( err ) 
		    	}

		    	this.app.conversations[ context.id ] = this
	      	this.context = context
	      	this.app.hideGroupMenu()
	      	this.app.updateConversationsListUI() 
	      	this._loadAdditionalInfo()
	      	this.app.openConversation( context.id )

		    }.bind( this ))

			}

		}

		_upgradeToRealConversation( callback ){

			callback = api.tool.secureCallback( callback )
			
			//Creating group
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

		addNewUser( userId ){

			api.user( userId, function( err, user ){

				if( err ){
					this.app.view.launchAlert( err );
				}

				this.moreUsers.push[ user ];
				this.app.view.updateMessagesUI( user );

			}.bind(this))

		}

		editConversation( info ){

			this.name = info.name

			//TODO cambiarMiembros
			var toDelete = []
	    var toAdd = []
	    console.log( this.users, info.members )

	    for( var i = 0; i < info.members.length; i++ ){

	    	var index = this.users.indexOf( info.members[i] )

	      if( index == -1 ){
	        toAdd.push( info.members[i] )
	      }

	    }

	    for( var i = 0; i < this.users.length; i++ ){

	    	var index = info.members.indexOf( this.users[i] )

	    	if( index == -1 ){
	        toDelete.push( this.users[i] )
	      }

	    }

	   	this.context.addUser( toAdd, function( err, res ){
	   		console.log( err )
	   	})

	   	this.context.removeUser( toDelete, function( err, res ){
	   		console.log( err )
	   	})
			console.log( toAdd, toDelete )
			this.app.hideGroupMenu()

		}

		sendBuffer( value ){

		  if( !value ){
		    return
		  }

		  this._upgradeToRealConversation( function(){

		  	this.app.view.clearInput()
		    this.context.send( { data : { action : 'message', text : value }, persistency : true, notify : value }, function( err ){

		      if( err ){
		      	return this.app.view.launchAlert( err )
		      }

		    }.bind( this ))

		  }.bind( this ))

		  return this

		}

		setOpened( value ){

		  this.opened = !!value
		  this.app.view.conversationSetOpened( this.context.id, this.opened )

		  return this

		}

		updateLastMessage( message ){

			if( message ){

				this.lastMessage = message
			  //view.updateConversationUI( this )
			  this.app.updateConversationsListUI()

			}

		}

		updateUI(){

		  var img

		  if( this.context.name ){

		    this.name = this.context.name
		    this.isGroup = true

		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    this.name = this.app.contacts[ this.users[ 0 ] ].user.fullName
		  }else{
		    // To Do -> lang.unknown
		  }

		  if( this.world && this.world.icon ){
		    this.img = this.world.icon.big // To Do -> Mirar si es el tamaño adecuado
		  }else if( this.isGroup ){
		  	this.img = ''
		  }else if( this.app.contacts[ this.users[ 0 ] ] ){
		    this.img = this.app.contacts[ this.users[ 0 ] ].user.avatar.big // To Do -> Mirar si es el tamaño adecuado
		  }

		  //TODO llamar a la view
		  this.app.view.updateConversationUI( this )

		  //Si la conversación esta abierta, tambien actualizamos su informacion en pantalla
		  if( this.app.openedChat && this.app.openedChat.context.id === this.context.id ){

				var isConnected = this.app.contacts[ this.users[ 0 ] ] && this.app.contacts[ this.users[ 0 ] ].connected
		  	this.app.view.updateConversationInfo( this, isConnected )

		  }

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

		}

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
