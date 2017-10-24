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

        if( e.which === 13 && !e.shiftKey && $.trim( this.dom.find('.conversation-input textarea').val() ) ){

          e.preventDefault();
          model.sendBuffer( $.trim( this.dom.find('.conversation-input textarea').val() ) );

        }

      }.bind( this ))

      this._domContactsList.on( 'click', '.contact', function(){
        model.openConversationWithContact( parseInt( $(this).attr('data-id') ) )
      })

      this._domConversationsList.on( 'click', '.channel', function(){
        model.openConversation( parseInt( $(this).attr('data-id') ) )
      })

      // COM API Events
      api.com.on( 'message', function( event ){

        console.log( event )
        if( event.data.action === 'message' ){

          model.ensureConversation( event.context, function( err ){

            if( err ){
              return;
            }

            model.handleMessage( event );

          })

        }

      })

      api.com.on( 'messageMarkedAsAttended', function( comMessageId, comContextId, userId, notificationId ){
        model.updateMessageAttendedUI( comMessageId, comContextId )
      })

    }  

  }

  return new Controller( model, view );

})( model, view )