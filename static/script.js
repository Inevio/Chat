
'use strict';

var preVideo    = $('.prevideo');
var videoInput  = $('.video-local')[ 0 ];
var videoOutput = $('.video-remote')[ 0 ];
var timer       = $('.control-time');
var timerStart;
var timerControl;
var webRtcPeer;

$('.control-name').text( params.user.fullName );
preVideo.find('img').attr( 'src', params.user.avatar.big );
preVideo.find('span').text('Preparing...');

if( params.type === 'startCall' ){

    kurentoUtils.WebRtcPeer.startSendRecv( videoInput, videoOutput, function( offerSdp, wp ){

        preVideo.find('span').text('Ringing...');

        webRtcPeer = wp;

        wz.webrtc.call( params.user.id, offerSdp );

    }, function( error ){});

}else{

    webRtcPeer = kurentoUtils.WebRtcPeer.startSendRecv( videoInput, videoOutput, function( offerSdp, wp ){

        preVideo.find('span').text('Connecting...');
        
        wz.webrtc.acceptCall( params.user.id, params.prevSpd, offerSdp );
        
    }, function(error){});

}

var generateTimerText = function( time ){

    var seconds, minutes, hours, result;

    time    = parseInt( time / 1000, 10 );
    seconds = time % 60;
    time    = parseInt( time / 60, 10 );
    minutes = time % 60;
    hours   = parseInt( time / 60, 10 );

    if( hours ){

        minutes = minutes.toString();

        if( minutes.length === 1 ){
            minutes = '0' + minutes;
        }

        result = hours + ':' + minutes;

    }else{
        result = minutes;
    }

    seconds = seconds.toString();

    if( seconds.length === 1 ){
        seconds = '0' + seconds;
    }

    result = result + ':' + seconds;

    return result;

};

wz.webrtc.on( 'callAccepted', function( userId, sdpAnswer ){

    preVideo.find('span').text('Connecting...');
    webRtcPeer.processSdpAnswer( sdpAnswer );

});

wz.webrtc.on( 'callStarted', function( userId, sdpAnswer ){
    webRtcPeer.processSdpAnswer( sdpAnswer );
});

$( videoOutput ).on( 'play', function() {
    
    if( timerStart ){
        return;
    }

    preVideo.remove();

    timerStart = Date.now();

    timerControl = setInterval( function(){
        timer.text( generateTimerText( Date.now() - timerStart ) )
    }, 1000 );

    timer.text( generateTimerText( 0 ) );

});
