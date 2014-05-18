
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
        
        var internCallType = ( wz.app.storage('callType') ) ? wz.app.storage('callType') : callType;

        if ( internCallType  === 1 ) {
            if ( event.stream.getVideoTracks().length > 0 ) {
                $('#camErr').css('display', 'none');
                remoteVideo.style.display = 'block';
                remoteVideo.src = URL.createObjectURL( event.stream );
                remoteVideo.play();
            } else {
                $('#camErr')[0].css('display', 'block');
                remoteVideo.style.display = 'none';
            }

        } else {

            $('#remoteAudio')[0].src = URL.createObjectURL( event.stream );
            $('#remoteAudio')[0].play();

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

            if ( data.event === 'newCall' && !wz.app.storage('done') ) {

                wz.user( info.sender, function ( err, user ) {

                    $('article').css('display', 'none');
                    $('#userCallAvatar')[0].src = user.avatar.big;
                    $('#userCallName').text( user.fullName );
                    $('#webrtc-callform').css('display', 'block');

                    channel    = wz.channel( info.id );
                    remoteDesc = new  RTCSessionDescription( data.desc );
                    callType   = data.callType;

                    if ( callType == 2 ) {
                        $('#userAvatarAudio')[0].src = user.avatar.big;
                        $('#userNameAudio').text( user.fullName );
                    }

                });

            } else if ( data.event === 'cancelCall' ) {
                
                $('article').css('display', 'none');
                $('#webrtc-userlist').css('display', 'block');
                actualReq = false;
                pc.close();

            } else if ( data.event === 'acceptCall' ) {

                pc.setRemoteDescription( new RTCSessionDescription( data.desc ));
                localVideo.play();
                $('article').css('display', 'none');

                var internCallType = wz.app.storage('callType');

                if ( internCallType === 1 ) {
                    $('#webrtc-call').css('display', 'block');
                } else {

                    $('#webrtc-audio').css('display', 'block');

                    wz.user( info.sender, function ( err, user ) {

                        $('#userAvatarAudio')[0].src = user.avatar.big;
                        $('#userNameAudio').text( user.fullName );
                        $('#webrtc-content').css('background', 'background: linear-gradient(#202020, #707070)');

                    });

                }

            } else if ( data.event === 'ICEcandidate' ) {

                var candidate = new RTCIceCandidate({
                    sdpMLineIndex: data.label,
                    candidate: data.candidate
                });

                pc.addIceCandidate( candidate );

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
            /*
            $('#userCallAvatar')[0].src = params.avatar;
            $('#userCallName').text( params.name );
            $('#webrtc-callform').css('display', 'block');
            */

            callType   = params.callType;

            channel    = wz.channel( params.channel );
            remoteDesc = new RTCSessionDescription( params.desc );

            /*
            if ( params.callType == 2 ) {
                $('#userAvatarAudio')[0].src = params.avatar;
                $('#userNameAudio').text( params.name );
            }
            */

            wz.banner()
                .setTitle('Incoming call')
                .setButton(0, 'cancel')
                .setButton(1, 'accept')
                .on( 'button', function ( button ) {
                    
                    if( !button ){

                        channel.send({ event: 'cancelCall' });
                        $('article').css('display', 'none');
                        $('#webrtc-userlist').css('display', 'block');
                        return;

                    }

                    callElements.video = ( callType === 2 ) ? false : true;

                    pc.setRemoteDescription( remoteDesc, function () {

                        navigator.getUserMedia(callElements, function ( stream ) {
                        
                            localStream = stream;
                            pc.addStream( stream );

                            pc.createAnswer( function ( desc ) {
                                
                                localDesc = new RTCSessionDescription( desc );
                                pc.setLocalDescription( localDesc );
                                channel.send({ event: 'acceptCall', desc: desc });

                                $('article').css('display', 'none');

                                if ( callType === 1 ) {
                                    $('#webrtc-call').css('display', 'block');
                                } else {
                                    $('#webrtc-audio').css('display', 'block');
                                }

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
    
    /*
    $('#cancel').on('click', function () {
        
        channel.send({ event: 'cancelCall' });
        $('article').css('display', 'none');
        $('#webrtc-userlist').css('display', 'block');

    });

    $('#accept').on('click', function (){

        callElements.video = ( callType === 2 ) ? false : true;

        pc.setRemoteDescription( remoteDesc, function () {

            navigator.getUserMedia(callElements, function ( stream ) {
            
                localStream = stream;
                pc.addStream( stream );

                pc.createAnswer( function ( desc ) {
                    
                    localDesc = new RTCSessionDescription( desc );
                    pc.setLocalDescription( localDesc );
                    channel.send({ event: 'acceptCall', desc: desc });

                    $('article').css('display', 'none');

                    if ( callType === 1 ) {
                        $('#webrtc-call').css('display', 'block');
                    } else {
                        $('#webrtc-audio').css('display', 'block');
                    }

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
    
    });
    */

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
