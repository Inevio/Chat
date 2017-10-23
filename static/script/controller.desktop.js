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
      this._bindEvents();
      this._fullLoad();

    }

    _bindEvents(){

      // DOM Events
      this.dom.on( 'click', '.tab-selector', function(){

        //TODO revisar valores

        if( $(this).hasClass('chat-tab-selector') ){
          model.changeSidebarMode( SIDEBAR_CONVERSATIONS )
        }else if( $(this).hasClass('contact-tab-selector') ){
          model.changeSidebarMode( SIDEBAR_CONTACTS )
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