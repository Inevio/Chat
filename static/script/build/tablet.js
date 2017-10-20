
var win = $(this);

var view = ( function(){

	var contactPrototype      = $( '.contact.wz-prototype' );
	var conversationPrototype = $( '.channel.wz-prototype' );

  class View{

  	constructor(){

  		// Static values
			this.MAINAREA_NULL = 0
			this.MAINAREA_CONVERSATION = 1
			this.SIDEBAR_NULL = 0
			this.SIDEBAR_CONVERSATIONS = 1
			this.SIDEBAR_CONTACTS = 2

  		//this.model = model;
  		this.dom = win;
  		this._mainAreaMode
  		this._sidebarMode

  		this._domContactsList = $('.contact-list', this.dom)
		  this._domConversationsList = $('.channel-list', this.dom)
		  this._domMessageContainer = $('.message-container', this.dom)
		  this._domMessageMePrototype = $('.message-me.wz-prototype', this._domMessageContainer)
		  this._domMessageOtherPrototype = $('.message-other.wz-prototype', this._domMessageContainer)
		  this._domCurrentConversation

  		this._translateInterface();
  		// Set modes
		  this.changeMainAreaMode( this.MAINAREA_NULL )
		  this.changeSidebarMode( this.SIDEBAR_NULL )

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

		changeMainAreaMode( value ){

		  if( this._mainAreaMode === value ){
		    return
		  }

		  this._mainAreaMode = value

		  if( this._mainAreaMode === this.MAINAREA_NULL ){
		    $('.ui-content').removeClass('visible')
		    $('.no-content').addClass('visible')
		  }else if( this._mainAreaMode === this.MAINAREA_CONVERSATION ){
		    $('.ui-content').addClass('visible')
		    $('.no-content').removeClass('visible')
		  }

		}

  	changeSidebarMode( value ){

		  this.dom.find( '.chat-footer > section' ).removeClass( 'active' )
		  this.dom.find( '.chat-body > section' ).removeClass( 'visible' )

		  if( this._sidebarMode === this.SIDEBAR_CONVERSATIONS ){

		    this.dom.find( '.chat-footer .chat-tab-selector' ).addClass( 'active' )
		    this.dom.find( '.chat-body .chat-tab' ).addClass( 'visible' )

		  }else if( this._sidebarMode === this.SIDEBAR_CONTACTS ){

		    this.dom.find( '.chat-footer .contact-tab-selector' ).addClass( 'active' )
		    this.dom.find( '.chat-body .contact-tab' ).addClass( 'visible' )

		  }

		}

		updateContactsListUI( list ){

			list = list.sort( function( a, b ){

		    if( a.connected && b.connected ){
		      return a.user.fullName.localeCompare( b.user.fullName )
		    }

		    if( a.connected ){
		      return -1
		    }

		    return 1

		  })

		  this._domContactsList.empty().append( list.map( function( item ){ 

	  		item.dom = contactPrototype.clone().removeClass('wz-prototype')
	  		item.dom.addClass( 'user-id-' + item.user.id );
			  item.dom.find('.contact-name').text( item.user.fullName )
			  item.dom.find('.contact-img').css( 'background-image', 'url(' + item.user.avatar.big + ')' )
			  item.dom.attr( 'data-id', item.user.id )

		  	return item.dom

		  }) )

		}

  	updateConversationUI(){

  		this.dom.attr( 'data-id' , this.context.id );
		  this.dom.find( '.channel-name' ).text( this.name );
		  this.dom.find( '.channel-img' ).css( 'background-image' , 'url(' + img + ')' );
		  this.dom.find( '.channel-last-msg' ).text( this.lastMessage ? this.lastMessage.data.text : '' );

  	}

  }

  class Contact{

  	constructor( app, user ){

  		this.dom = contactPrototype.clone().removeClass('wz-prototype')
  		this.dom.addClass( 'user-id-' + this.user.id );
		  this.dom.find('.contact-name').text( this.user.fullName )
		  this.dom.find('.contact-img').css( 'background-image', 'url(' + this.user.avatar.big + ')' )
		  this.dom.attr( 'data-id', this.user.id )

  	}

   	setConnection( value ){

		  if( !!value ){
		    this.dom.addClass('conected')
		  }else{
		    this.dom.removeClass('connected')
		  }

  	}

  }

  class Conversation{

  	constructor( app, context ){

  		this.dom = contactPrototype.clone().removeClass('wz-prototype')
  		this.dom.addClass( 'user-id-' + this.user.id );
		  this.dom.find('.contact-name').text( this.user.fullName )
		  this.dom.find('.contact-img').css( 'background-image', 'url(' + this.user.avatar.big + ')' )
		  this.dom.attr( 'data-id', this.user.id )

  	}

  }

  return new View()

})()

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
      this._fullLoad();

    }

    _bindEvents(){

      // DOM Events
      this.dom.on( 'click', '.tab-selector', function(){

        //TODO revisar valores
        if( $(this).hasClass('chat-tab-selector') ){
          view.changeSidebarMode( App.SIDEBAR_CONVERSATIONS )
        }else if( $(this).hasClass('contact-tab-selector') ){
          view.changeSidebarMode( App.SIDEBAR_CONTACTS )
        }

      })

      this.dom.on( 'keypress', function( e ){

        if( e.which === 13 && !e.shiftKey && that.openedChat ){

          e.preventDefault();
          //that.openedChat.sendBuffer();

        }

      })

      this._domContactsList.on( 'click', '.contact', function(){
        //that.openConversationWithContact( that.contacts[ parseInt( $(this).attr('data-id') ) ] )
      })

      this._domConversationsList.on( 'click', '.channel', function(){
        //that.openConversation( that.conversations[ parseInt( $(this).attr('data-id') ) ] )
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

    _fullLoad(){

      model.fullLoad();

    }    

  }

  return new Controller( model, view );

})( model, view )