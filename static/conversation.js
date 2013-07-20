
wz.widget.addScript( 14, 'conversation', function( widget, wid, lang, params ){

    // Local Variables
    var header       = $( '.weechat-friends-card', widget );
    var counter      = $( '.weechat-counter', header );
    var conversation = $( '.weechat-conversation-opened', widget );    
    var message      = $( '.weechat-conversation-opened article.wz-prototype', widget );
    var textarea     = $( 'textarea', widget );
    var user         = null;

    // Local Functions
    var sendMessage = function( message ){
        
        if( message.length ){

            var banner = wz.banner()
                .title( lang.newMessage )
                .text( message )
                .image( wz.info.user().avatar.tiny )
                .extract();

            wz.message()
                .widget( 1 )
                .user( user.id )
                .message( message )
                .banner( banner )
                .self( true )
                .send();

            addMessage( message, true );

        }

    };

    var addMessage = function( text, self ){

        var item = message.clone();

        var date = new Date();

        var hour = date.getHours();
            if( hour < 10 ){ hour = '0' + hour; }
        var minute = date.getMinutes();
            if( minute < 10 ){ minute = '0' + minute; }

        item
            .removeClass()
            .addClass( ( self ) ? 'me' : 'you' )
            .children('.weechat-conversation-message')
                .text( text );

        item
            .children('.weechat-conversation-hour')
                .text( hour + ':' + minute );

        conversation
            .append( item );

        conversation.scrollTop( conversation[ 0 ].scrollHeight );

    };

    // Events
    widget

    .on( 'mousedown', function( e ){

        if( !widget.hasClass('wz-deskitem-focus') ){
            e.preventDefault();
        }

    })

    .on( 'widget-param', function( event, params ){

        user = params[ 0 ];
        status = params[ 1 ];

        widget.addClass( 'weechat-user-' + user.id );
        header.addClass( params[ 1 ] );

        header.find( 'img' )
            .attr( 'src', user.avatar.tiny )

        header.find( 'span' )
            .text( user.fullName );

        if( params[ 2 ] ){
            
            widget.trigger( 'message', [ params[ 2 ] ] );

            if( widget.hasClass('hidden') ){
                header.click();
            }

        }else{
            header.click();
        }

        widget.removeClass( 'messages' );

    })

    .on( 'message', function( e, data ){

        if( user.id === parseInt( data.user.id, 10 ) ){ // To Do -> Si esto estuviese bien parseado se podria quitar el parseInt

            addMessage( data.message, Boolean( data.self ) );

            if( !data.self && widget.hasClass('hidden') ){

                widget.addClass( 'messages' );

                wz.banner()
                    .title( data.banner.title )
                    .text( data.banner.text )
                    .image( data.banner.image )
                    .render();

                var num = parseInt( counter.text() );

                if( isNaN( num ) ){
                    num = 0;
                }

                if( num < 999 ){
                    counter.text( ++num );
                }else{
                    counter.text( '+' );
                }

            }else{
                widget.removeClass( 'messages' );
            }

        }

    })

    .on( 'wz-focus', function(){

        if( !widget.hasClass('hidden') ){
            textarea.focus();            
        }

    })

    .on( 'wz-blur', function(){
        textarea.blur();
    })

    .on( 'user-connect', function( event, data ){

        if( user.id === data.id ){ 

            header.removeClass( 'offline' ).addClass( 'online' );

        }

    })

    .on( 'user-disconnect', function( event, data ){

        if( user.id === data.id ){ 

            header.removeClass( 'online' ).addClass( 'offline' );

        }

    });

    header

    .on( 'click', '.wz-win-close', function( e ){

        e.stopPropagation();
        widget.remove();

    })

    .on( 'click', function(){

        widget.toggleClass('hidden');

        if( !widget.hasClass('hidden') ){

            counter.text('');
            textarea.focus();

        }else{
            textarea.blur();
        }

    });

    textarea
    .on( 'keypress', function( e ){

        if( e.which === 13 ){

            e.preventDefault();

            var text = $( this ).val();

            if( $.trim( text ).length ){

                sendMessage( text );
                $( this ).val('');

            }

        }

    });

    // Start the widget
    widget.addClass('weechat-conversation hidden');

    var others     = wz.tool.widget( 1, 'conversation' ).not( widget );
    var othersSize = others.size();

    if( othersSize ){

        widget.css({
            right : ( ( othersSize + 1 ) * 5 ) + ( othersSize * widget.width() ) + wz.tool.widget( 1, 'list' ).children('.weechat-icon').width()
        });
        
    }

    // Nullify
    others = othersSize = null;

});
