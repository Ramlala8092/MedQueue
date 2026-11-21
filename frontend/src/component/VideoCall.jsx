


import { useCallback, useEffect, useRef, useState } from "react";

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export default function VideoCall({ socket, appointmentId }) {
  const [status, setStatus] = useState("idle");
  const [incoming, setIncoming] = useState(null);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const localStream = useRef(null);
  const peer = useRef(null);
  const pendingCandidates = useRef([]);
  const statusRef = useRef("idle");

  const updateStatus = useCallback((nextStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const startMedia = useCallback(async () => {
    if (localStream.current) return localStream.current;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Camera ke liye localhost ya HTTPS use karein.");
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    localStream.current = stream;

    if (localVideo.current) {
      localVideo.current.srcObject = stream;
    }

    return stream;
  }, []);

  const createPeer = useCallback(async () => {
    if (peer.current) return peer.current;

    const stream = await startMedia();
    const connection = new RTCPeerConnection(rtcConfig);

    stream.getTracks().forEach((track) => {
      connection.addTrack(track, stream);
    });

    connection.ontrack = (event) => {
      const remoteStream =
        event.streams?.[0] || new MediaStream([event.track]);

      if (remoteVideo.current) {
        remoteVideo.current.srcObject = remoteStream;
      }
    };

    connection.onicecandidate = (event) => {
      if (event.candidate && socket?.connected) {
        socket.emit("call:ice-candidate", {
          appointmentId,
          candidate: event.candidate,
        });
      }
    };

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === "connected") {
        updateStatus("active");
        setError("");
      } else if (connection.connectionState === "failed") {
        setError("Connection fail hui. Network ya TURN server check karein.");
      } else if (connection.connectionState === "disconnected") {
        setError("Connection toot gaya. Dobara connect karne ki koshish karein.");
      }
    };

    peer.current = connection;
    return connection;
  }, [appointmentId, socket, startMedia, updateStatus]);

  const flushCandidates = useCallback(async (connection) => {
    if (!connection.remoteDescription) return;

    const candidates = pendingCandidates.current.splice(0);

    for (const candidate of candidates) {
      try {
        await connection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    }
  }, []);

  const cleanup = useCallback(() => {
    if (peer.current) {
      peer.current.ontrack = null;
      peer.current.onicecandidate = null;
      peer.current.onconnectionstatechange = null;
      peer.current.close();
      peer.current = null;
    }

    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    if (localVideo.current) localVideo.current.srcObject = null;
    if (remoteVideo.current) remoteVideo.current.srcObject = null;

    pendingCandidates.current = [];
    setIncoming(null);
    setMuted(false);
    setCameraOff(false);
    updateStatus("idle");
  }, [updateStatus]);

  useEffect(() => {
    return () => {
      if (peer.current) {
        peer.current.close();
        peer.current = null;
      }

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
        localStream.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!socket || !appointmentId) return undefined;

    const matchesAppointment = (data) =>
      String(data?.appointmentId) === String(appointmentId);

    function onIncoming(data) {
      if (!matchesAppointment(data)) return;
      if (statusRef.current !== "idle") return;

      setError("");
      setIncoming(data.caller || { name: "Doctor / Patient" });
      updateStatus("incoming");
    }

    async function onAccepted(data) {
      if (!matchesAppointment(data)) return;

      try {
        updateStatus("connecting");

        const connection = await createPeer();
        const offer = await connection.createOffer();

        await connection.setLocalDescription(offer);

        socket.emit("call:offer", {
          appointmentId,
          offer: connection.localDescription,
        });
      } catch (err) {
        setError(err.message || "Call start nahi ho saki.");
      }
    }

    async function onOffer(data) {
      if (!matchesAppointment(data) || !data.offer) return;

      try {
        updateStatus("connecting");

        const connection = await createPeer();

        await connection.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );

        await flushCandidates(connection);

        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);

        socket.emit("call:answer", {
          appointmentId,
          answer: connection.localDescription,
        });
      } catch (err) {
        setError(err.message || "Call connect nahi hui.");
      }
    }

    async function onAnswer(data) {
      if (!matchesAppointment(data) || !data.answer) return;

      try {
        const connection = peer.current;
        if (!connection) return;

        await connection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );

        await flushCandidates(connection);
      } catch (err) {
        setError(err.message || "Call answer process nahi hua.");
      }
    }

    async function onCandidate(data) {
      if (!matchesAppointment(data) || !data.candidate) return;

      const connection = peer.current;

      if (!connection || !connection.remoteDescription) {
        pendingCandidates.current.push(data.candidate);
        return;
      }

      try {
        await connection.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (err) {
        console.error("ICE candidate error:", err);
      }
    }

    function onEnded(data) {
      if (!matchesAppointment(data)) return;
      cleanup();
    }

    function onRejected(data) {
      if (!matchesAppointment(data)) return;

      cleanup();
      setError("Doosre user ne call reject kar di.");
    }

    socket.on("call:incoming", onIncoming);
    socket.on("call:accept", onAccepted);
    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice-candidate", onCandidate);
    socket.on("call:end", onEnded);
    socket.on("call:reject", onRejected);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:accept", onAccepted);
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice-candidate", onCandidate);
      socket.off("call:end", onEnded);
      socket.off("call:reject", onRejected);
    };
  }, [
    socket,
    appointmentId,
    createPeer,
    flushCandidates,
    cleanup,
    updateStatus,
  ]);

  function startCall() {
    setError("");

    if (!socket?.connected) {
      setError("Server se connection nahi hai.");
      return;
    }

    if (statusRef.current !== "idle") return;

    socket.emit("call:start", { appointmentId }, (result) => {
      if (!result?.success) {
        setError(result?.message || "Call request fail hui.");
        return;
      }

      updateStatus("calling");
    });
  }

  async function acceptCall() {
    setError("");

    try {
      await startMedia();

      socket.emit("call:accept", { appointmentId }, (result) => {
        if (!result?.success) {
          setError(result?.message || "Call accept nahi hui.");
          return;
        }

        setIncoming(null);
        updateStatus("connecting");
      });
    } catch (err) {
      setError(
        err.name === "NotAllowedError"
          ? "Camera aur microphone ki permission allow karein."
          : err.message || "Camera start nahi hua."
      );
    }
  }

  function rejectCall() {
    socket?.emit("call:reject", { appointmentId });
    cleanup();
  }

  function endCall() {
    socket?.emit("call:end", { appointmentId });
    cleanup();
  }

  function toggleMic() {
    const nextMuted = !muted;

    localStream.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });

    setMuted(nextMuted);
  }

  function toggleCamera() {
    const nextCameraOff = !cameraOff;

    localStream.current?.getVideoTracks().forEach((track) => {
      track.enabled = !nextCameraOff;
    });

    setCameraOff(nextCameraOff);
  }

  
return (
  <section className={`video-call-panel ${["calling", "connecting", "active"].includes(status) ? "video-call-fullscreen" : ""}`}>
    {error && (
      <p className="video-call-error" role="alert">
        {error}
      </p>
    )}

    {status === "idle" && (
      <button type="button" onClick={startCall}>
        Start Video Call
      </button>
    )}

    {status === "incoming" && (
      <div className="video-call-incoming">
        <p>
          Incoming video call from {incoming?.name || "Doctor / Patient"}
        </p>
        <button type="button" onClick={acceptCall}>Accept</button>
        <button type="button" onClick={rejectCall}>Reject</button>
      </div>
    )}

    {["calling", "connecting", "active"].includes(status) && (
      <div className="vc-stage">
        <video
          ref={remoteVideo}
          autoPlay
          playsInline
          className="vc-remote-video"
        />

        <div className="vc-top-bar">
          <span className="vc-live-dot" />
          {status === "calling"
            ? "Calling..."
            : status === "connecting"
              ? "Connecting..."
              : "Video consultation"}
        </div>

        <div className="vc-local-window">
          <video
            ref={localVideo}
            autoPlay
            muted
            playsInline
          />
          <span>You</span>
        </div>

        <div className="vc-bottom-controls">
          <button
            type="button"
            className={`vc-control ${cameraOff ? "vc-disabled" : ""}`}
            onClick={toggleCamera}
            aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
            title={cameraOff ? "Camera on" : "Camera off"}
          >
            {cameraOff ? "📷" : "▣"}
          </button>

          <button
            type="button"
            className="vc-control vc-end-call"
            onClick={endCall}
            aria-label="End call"
            title="End call"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 14.5 2.8 11a2 2 0 0 1 1.1-2.4 19 19 0 0 1 16.2 0 2 2 0 0 1 1.1 2.4L20 14.5a2 2 0 0 1-2.7 1.1l-2.5-1.2a2 2 0 0 1-1.1-1.8v-1a13 13 0 0 0-3.4 0v1a2 2 0 0 1-1.1 1.8l-2.5 1.2A2 2 0 0 1 4 14.5Z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            type="button"
            className={`vc-control ${muted ? "vc-disabled" : ""}`}
            onClick={toggleMic}
            aria-label={muted ? "Unmute microphone" : "Mute microphone"}
            title={muted ? "Unmute microphone" : "Mute microphone"}
          >
            {muted ? "🔇" : "🎙"}
          </button>
        </div>
      </div>
    )}
  </section>
);


  // return (
  //   <section className="video-call-panel">
  //     {error && (
  //       <p className="video-call-error" role="alert">
  //         {error}
  //       </p>
  //     )}

  //     {status === "idle" && (
  //       <button type="button" onClick={startCall}>
  //         Start Video Call
  //       </button>
  //     )}

  //     {status === "incoming" && (
  //       <div className="video-call-incoming">
  //         <p>
  //           Incoming video call from {incoming?.name || "Doctor / Patient"}
  //         </p>

  //         <button type="button" onClick={acceptCall}>
  //           Accept
  //         </button>

  //         <button type="button" onClick={rejectCall}>
  //           Reject
  //         </button>
  //       </div>
  //     )}

  //     {["calling", "connecting", "active"].includes(status) && (
  //       <>
  //         <p>
  //           {status === "calling"
  //             ? "Calling..."
  //             : status === "connecting"
  //               ? "Connecting..."
  //               : "Call connected"}
  //         </p>

  //         <div className="video-call-area">
  //           <div className="video-call-grid">
  //             <div>
  //               <p>Doctor / Patient</p>
  //               <video
  //                 ref={remoteVideo}
  //                 autoPlay
  //                 playsInline
  //               />
  //             </div>

  //             <div>
  //               <p>You</p>
  //               <video
  //                 ref={localVideo}
  //                 autoPlay
  //                 muted
  //                 playsInline
  //               />
  //             </div>
  //           </div>

  //           <div className="video-call-controls video-call-overlay">
  //             <button type="button" onClick={toggleMic}>
  //               {muted ? "Unmute Mic" : "Mute Mic"}
  //             </button>

  //             <button type="button" onClick={toggleCamera}>
  //               {cameraOff ? "Camera On" : "Camera Off"}
  //             </button>

  //             <button
  //               type="button"
  //               className="video-call-end"
  //               onClick={endCall}
  //             >
  //               End Call
  //             </button>
  //           </div>
  //         </div>
  //       </>
  //     )}
  //   </section>
  // );
}



