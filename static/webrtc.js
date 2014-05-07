var configuration      = { "iceServers": [
    								{
    									url: 'turn:numb.viagenie.ca',
    									credential: 'mangakas123',
    									username: 'rrojot@hotmail.com'
    								},
                                    {
                                        url: 'turn:192.158.29.39:3478?transport=udp',
                                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                                        username: '28224511:1379330808'
                                    },
                                    {
                                        url: 'turn:192.158.29.39:3478?transport=tcp',
                                        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                                        username: '28224511:1379330808'
                                    },
                                    {
                                        url: 'turn:192.158.30.23:3478?transport=udp',
                                        credential: 'RaebIwHQPUmabKiySrCr8kbHtSg=',
                                        username: '1394128738:02043197'
                                    },
                                    {
                                        url: 'turn:192.158.30.23:3478?transport=tcp',
                                        credential: 'RaebIwHQPUmabKiySrCr8kbHtSg=',
                                        username: '1394128738:02043197'
                                    }
                                 ]};

navigator.getUserMedia     = navigator.getUserMedia  || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

wz.app.storage('PeerConnection', RTCPeerConnection);
wz.app.storage('configuration', configuration);