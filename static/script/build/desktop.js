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

  	constructor(){

  	  this.openedChat
		  this.contacts = {}
		  this.conversations = {}

		  this._fullLoad();

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

		_fullLoad(){

		  // To Do -> Remove timeout

		  async.parallel({

		    contacts : this._loadFullContactsList.bind(this),
		    conversations : this._loadFullConversationsList.bind(this)

		  }, function( err, res ){

		    console.log( err, res )

		    /*if( this._sidebarMode !== App.SIDEBAR_NULL ){
		      return
		    }if( res.conversations.length ){
		      this._changeSidebarMode( App.SIDEBAR_CONVERSATIONS )
		    }else if( res.contacts.contacts.length ){
		      this._changeSidebarMode( App.SIDEBAR_CONTACTS )
		    }else{
		      // To Do -> Show forever alone
		    }*/

		  }.bind(this))

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

		setContactConnection( id, connected ){

		  if( this.contacts[ id ] ){
		    this.contacts[ id ].setConnection( connected )
		  }

		  return this

		}

  }

  class Contact{

  	constructor( user ){

  		this.user = user;
  		this.connected = false;

  	}

  	setConnection( value ){

  		this.connected = !!value

		  /*if( this.connected ){
		    this.dom.addClass('conected')
		  }else{
		    this.dom.removeClass('connected')
		  }*/

		  //TODO Actualizar lista

		  //this.app.updateContactsListUI()

  	}

  }

  class Conversation{

  	constructor( context ){

		  this.context = context
		  this.users = []
		  this.world
		  this.lastMessage
		  this.opened = false
		  this.isGroup = false // To Do
		  this.name // To Do -> Default value

		  // Set UI
		  this._loadAdditionalInfo()
		  //this.updateUI()

  	}

  	_loadAdditionalInfo(){

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

  return new Model()

})( view )

const win = $( this );

var view = ( function( model ){

  class View{

  	constructor( model ){

  		this.model = model;
  		this.dom = win;

  		this._translateInterface();

  	}

  	_translateInterface(){

		  $( '.addPeople span' , this.dom ).text( lang.addPeople );
		  $( '.app-color .dark' , this.dom ).text( lang.dark );
		  $( '.app-color .white' , this.dom ).text( lang.white );
		  $( '.cancel-group span' , this.dom ).text( lang.cancel );
		  $( '.chat-search input' , this.dom ).attr( 'placeholder' , lang.search );
		  $( '.chat-tab-selector span' , this.dom ).text( lang.chats );
		  $( '.click-chat-txt' , this.dom ).text( lang.clickChat );
		  $( '.close-coversation' , this.dom ).text( lang.close );
		  $( '.contact-tab-selector span' , this.dom ).text( lang.contacts );
		  $( '.conversation-input textarea' , this.dom ).attr( 'placeholder' , lang.msg );
		  $( '.group-info .title' , this.dom ).text( lang.info );
		  $( '.group-members .title' , this.dom ).text( lang.members );
		  $( '.group-members input' , this.dom ).attr( 'placeholder' , lang.searchContacts );
		  $( '.group-menu .back span' , this.dom ).text( lang.back );
		  $( '.group-menu .edit' , this.dom ).text( lang.edit );
		  $( '.group-name' , this.dom ).text( lang.groupName );
		  $( '.group-name-input input' , this.dom ).attr( 'placeholder' , lang.groupName );
		  $( '.groupName' , this.dom ).text( lang.nameGroup );
		  $( '.invite .add' , this.dom ).text( lang.invite.add );
		  $( '.invite .next' , this.dom ).text( lang.invite.send );
		  $( '.invite h1' , this.dom ).text( lang.invite.title );
		  $( '.invite h2' , this.dom ).html( lang.invite.subtitle );
		  $( '.invite h3' , this.dom ).text( lang.invite.email );
		  $( '.new-group-button span' , this.dom ).text( lang.newGroup );
		  $( '.no-chat-txt' , this.dom ).text( lang.noChat );
		  $( '.save-group span' , this.dom ).text( lang.save );
		  $( '.send-txt' , this.dom ).text( lang.send );

  	}

  	updateConversationUI(){

  		this.dom.attr( 'data-id', this.context.id );
		  this.dom.find( '.channel-name' ).text( this.name );
		  this.dom.find( '.channel-img' ).css( 'background-image' , 'url(' + img + ')' );
		  this.dom.find( '.channel-last-msg' ).text( this.lastMessage ? this.lastMessage.data.text : '' );

  	}

  }

  return new View()

})( model )

const win = $( this );

var controller = ( function( model, view ){

  class Controller{

    constructor( model, view ){

      this.dom = win
      this._domContactsList = $('.contact-list', this.dom)
      this._domConversationsList = $('.channel-list', this.dom)
      this._domMessageContainer = $('.message-container', this.dom)
      this._domMessageMePrototype = $('.message-me.wz-prototype', this._domMessageContainer)
      this._domMessageOtherPrototype = $('.message-other.wz-prototype', this._domMessageContainer)
      this._domCurrentConversation
      this.model = model;
      this.view = view;

    }

    _bindEvents(){

      // DOM Events
      this.dom.on( 'click', '.tab-selector', function(){

        /*if( $(this).hasClass('chat-tab-selector') ){
          that._changeSidebarMode( App.SIDEBAR_CONVERSATIONS )
        }else if( $(this).hasClass('contact-tab-selector') ){
          that._changeSidebarMode( App.SIDEBAR_CONTACTS )
        }*/

      })

      this._domConversationsList.on( 'click', '.channel', function(){
        //that.openConversation( that.conversations[ parseInt( $(this).attr('data-id') ) ] )
      })

      this._domContactsList.on( 'click', '.contact', function(){
        //that.openConversationWithContact( that.contacts[ parseInt( $(this).attr('data-id') ) ] )
      })

      this.dom.on( 'keypress', function( e ){

        if( e.which === 13 && !e.shiftKey && that.openedChat ){

          e.preventDefault();
          //that.openedChat.sendBuffer();

        }

      })

      // COM API Events
      api.com.on( 'message', function( event ){

        if( event.data.action === 'message' ){

          /*that._ensureConversation( event.context, function( err ){

            // To Do -> Error

            that.conversations[ event.context ].updateLastMessage( event )
            that._appendMessage( event )

          })*/

        }

      })

      api.com.on( 'messageMarkedAsAttended', function( comMessageId, comContextId, userId, notificationId ){
        //that._updateMessageAttendedUI( comMessageId, comContextId )
      })

    }    

  }

  return new Controller( model, view );

})( model, view )
