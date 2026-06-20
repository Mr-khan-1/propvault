import React, { useEffect, useRef, useState } from 'react';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize } from 'lucide-react';
import Peer from 'peerjs';

const CallModal = ({ callData, socket, currentUser, chatPartner, onClose }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(callData?.incoming || false);
  const [callerSignal, setCallerSignal] = useState(callData?.signalData);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callData?.type === 'audio');
  
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // Get media permissions and stream
    navigator.mediaDevices.getUserMedia({ 
      video: callData.type === 'video', 
      audio: true 
    }).then((currentStream) => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }
    }).catch(err => {
      console.error("Failed to get local stream", err);
    });

    socket.on('call_accepted', (signal) => {
      setCallAccepted(true);
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
    });
    
    socket.on('call_ended', () => {
      endCall(false); // End call but don't emit back
    });

    return () => {
      socket.off('call_accepted');
      socket.off('call_ended');
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // For demonstration, simulating WebRTC connection state
  // In a full production app, you would use simple-peer here
  useEffect(() => {
    if (callAccepted && stream && userVideo.current) {
      // Fake remote stream setup for demonstration
      // In reality: connectionRef.current.on('stream', remoteStream => userVideo.current.srcObject = remoteStream)
      userVideo.current.srcObject = stream; // Mirroring for demo
    }
  }, [callAccepted, stream]);

  const answerCall = () => {
    setCallAccepted(true);
    socket.emit('answer_call', { signal: "dummy-signal", to: callData.callerId });
  };

  const endCall = (emit = true) => {
    setCallEnded(true);
    if (emit) {
      socket.emit('end_call', { to: callData.incoming ? callData.callerId : chatPartner._id });
    }
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }
    onClose();
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream && stream.getVideoTracks().length > 0) {
      stream.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-700 relative flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-800/80 absolute top-0 w-full z-10 flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold">{chatPartner.name}</h3>
            <p className="text-slate-400 text-xs">
              {callAccepted ? '00:00 - Connected' : receivingCall ? 'Incoming call...' : 'Calling...'}
            </p>
          </div>
          <button onClick={() => endCall()} className="text-slate-400 hover:text-white">
            <Maximize size={18} />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative h-96 bg-black flex items-center justify-center">
          {callAccepted ? (
            <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg animate-pulse">
              {chatPartner.name?.charAt(0)}
            </div>
          )}

          {/* Self View Mini */}
          {stream && !isVideoOff && (
            <div className="absolute bottom-4 right-4 w-32 h-44 bg-slate-800 rounded-lg overflow-hidden shadow-lg border-2 border-slate-700">
              <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-6 bg-slate-800 flex justify-center items-center gap-6">
          {!callAccepted && receivingCall ? (
            <>
              <button onClick={answerCall} className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20">
                <Phone size={24} />
              </button>
              <button onClick={() => endCall()} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                <PhoneOff size={24} />
              </button>
            </>
          ) : (
            <>
              <button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button onClick={() => endCall()} className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                <PhoneOff size={28} />
              </button>
              <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}`} disabled={callData.type === 'audio'}>
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallModal;
