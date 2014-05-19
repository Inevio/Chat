
    var win            = $( this );
    var channel        = null;
    var localStream;
    var remoteDesc;
    var localDesc;
    var actualReq      = false;
    var remoteVideo    = $('.video-remote')[0], localVideo = $('.video-local')[0];
    var callElements   = { video: true, audio: true };
    var callType       = 0;
    localVideo.muted   = true;
    
    pc.onaddstream     = streamAdded;
    pc.onicecandidate  = ICEcandidate;


    if ( typeof mozRTCSessionDescription !== 'undefined' ) {
        RTCSessionDescription = mozRTCSessionDescription;
    }

    if ( typeof mozRTCIceCandidate !== 'undefined' ) {
        RTCIceCandidate = mozRTCIceCandidate;
    }

    function streamAdded ( event ) {
        
        console.log("Stream received");
        
        if ( event.stream.getVideoTracks().length > 0 ) {
            $('#camErr').css('display', 'none');
            remoteVideo.style.display = 'block';
            remoteVideo.src = URL.createObjectURL( event.stream );
            remoteVideo.play();
        } else {
            $('#camErr')[0].css('display', 'block');
            remoteVideo.style.display = 'none';
        }

    }

    function ICEcandidate ( e ) {
        
        var internChannel = ( wz.app.storage('channel') === undefined ) ? channel : wz.app.storage('channel');

        if ( e.candidate ) {

            internChannel.send({
                event: "ICEcandidate",
                label: e.candidate.sdpMLineIndex,
                id: e.candidate.sdpMid,
                candidate: e.candidate.candidate
            });

        }

    }

    wz.channel.on( 'message', function( info, data ){

        if( info.sender !== wz.system.user().id ){

            if ( data.event === 'cancelCall' ) {
                
                $('article').css('display', 'none');
                $('#webrtc-userlist').css('display', 'block');
                actualReq = false;
                pc.close();

            } else if ( data.event === 'acceptCall' ) {

                pc.setRemoteDescription( new RTCSessionDescription( data.desc ));
                localVideo.play();
                $('article').css('display', 'none');

                var internCallType = wz.app.storage('callType');
                $('#webrtc-call').css('display', 'block');

            } else if ( data.event === 'ICEcandidate' ) {

                pc.addIceCandidate( new RTCIceCandidate({
                    sdpMLineIndex: data.label,
                    candidate: data.candidate
                }) );

            } else if ( data.event === 'stopCall' ) {

                $('article').css('display', 'none');
                $('#webrtc-userlist').css('display', 'block');
                actualReq  = false;
                localDesc  = null;
                remoteDesc = null;
                pc.close();

                pc = new RTCPeerConnection( configuration );
                pc.onaddstream    = streamAdded;
                pc.onicecandidate = ICEcandidate;

                localVideo.pause();
                localVideo.src = "";

                remoteVideo.pause();
                remoteVideo.src = "";

                localStream.stop();

            }

        }

    });

    win.on('app-param', function ( error, params ) {

        if ( params.event == 'newSuspCall' ) {

            $('article').css('display', 'none');
            channel    = wz.channel( params.channel );

            wz.banner()
                .setTitle('Incoming call')
                .setButton(0, 'Cancel', 'cancel')
                .setButton(1, 'Accept', 'accept')
                .on( 'button', function ( button ) {
                    
                    if( !button ){
                        channel.send({ event: 'cancelCall' });
                        $('article').css('display', 'none');
                        $('#webrtc-userlist').css('display', 'block');
                        return;
                    }

                    pc.setRemoteDescription( new RTCSessionDescription( params.desc ), function () {

                        navigator.getUserMedia({ audio: true, video: true }, function ( stream ) {
                        
                            localStream = stream;
                            pc.addStream( stream );

                            pc.createAnswer( function ( desc ) {
                                
                                pc.setLocalDescription( new RTCSessionDescription( desc ) );
                                channel.send({ event: 'acceptCall', desc: desc });

                                $('article').css('display', 'none');
                                $('#webrtc-call').css('display', 'block');

                                localVideo.src = URL.createObjectURL( localStream );
                                localVideo.play();

                            }, function ( err ) {
                                console.log( err );
                            });

                        }, function ( err ) {
                            console.log( err );
                        });

                    }, function ( err ) {
                        if ( err ) console.log( err );
                    });

                })
                .render();

        } else if ( params.event === 'localVid' ) {
            localVideo.src = URL.createObjectURL( params.stream );
            localVideo.play();
        }

    });

    $('.hangup').on('click', function () {

        channel.send({ event: 'stopCall' });
        $('article').css('display', 'none');
        $('#webrtc-userlist').css('display', 'block');
        actualReq  = false;
        localDesc  = null;
        remoteDesc = null;
        pc.close();

        pc = new RTCPeerConnection( configuration );
        pc.onaddstream    = streamAdded;
        pc.onicecandidate = ICEcandidate;

        localVideo.pause();
        localVideo.src = "";

        remoteVideo.pause();
        remoteVideo.src = "";

        localStream.stop();

    });
