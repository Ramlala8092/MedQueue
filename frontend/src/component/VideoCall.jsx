

import { useCallback, useEffect, useRef, useState } from "react";

const rtcConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export default function VideoCall({
  socket,
  appointmentId,
  userRole,
}) {
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
  const audioContext = useRef(null);
  const ringtoneTimer = useRef(null);

  const updateStatus = useCallback((nextStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  // Incoming call ringtone.
  const stopRingtone = useCallback(() => {
    if (ringtoneTimer.current) {
      clearInterval(ringtoneTimer.current);
      ringtoneTimer.current = null;
    }

    if (audioContext.current) {
      audioContext.current.close().catch(() => { });
      audioContext.current = null;
    }
  }, []);

  const playRingtone = useCallback(() => {
    stopRingtone();

    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) return;

      const context = new AudioContextClass();
      audioContext.current = context;

      const playBeep = () => {
        if (context.state === "closed") return;

        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = 880;

        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.15,
          context.currentTime + 0.05
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          context.currentTime + 0.6
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.65);
      };

      context.resume().then(() => {
        playBeep();
        ringtoneTimer.current = setInterval(playBeep, 1200);
      }).catch(() => { });
    } catch (err) {
      console.error("Ringtone error:", err);
    }
  }, [stopRingtone]);

  const showIncomingNotification = useCallback((caller) => {
    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      try {
        const notification = new Notification(
          "MedQueue - Incoming Video Call",
          {
            body: `${caller?.name || "Doctor"} is calling you.`,
            tag: `medqueue-call-${appointmentId}`,
          }
        );

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (err) {
        console.error("Notification error:", err);
      }
    }
  }, [appointmentId]);

  const startMedia = useCallback(async () => {
    if (localStream.current) return localStream.current;

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Camera ke liye localhost ya HTTPS use karein."
      );
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
        setError(
          "Connection fail hui. Network ya TURN server check karein."
        );
      } else if (connection.connectionState === "disconnected") {
        setError("Connection toot gaya. Network check karein.");
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
    stopRingtone();

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
  }, [stopRingtone, updateStatus]);

  // Cleanup when component is removed.
  useEffect(() => {
    return () => {
      stopRingtone();

      if (peer.current) {
        peer.current.close();
        peer.current = null;
      }

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => track.stop());
        localStream.current = null;
      }
    };
  }, [stopRingtone]);

  // Socket signaling events.
  useEffect(() => {
    if (!socket || !appointmentId) return undefined;

    const matchesAppointment = (data) =>
      String(data?.appointmentId) === String(appointmentId);

    function onIncoming(data) {
      if (!matchesAppointment(data)) return;
      if (userRole !== "patient") return;
      if (statusRef.current !== "idle") return;

      setError("");
      setIncoming(data.caller || { name: "Doctor" });
      updateStatus("incoming");

      playRingtone();
      showIncomingNotification(data.caller);
    }

    async function onAccepted(data) {
      if (!matchesAppointment(data)) return;
      if (userRole !== "doctor") return;

      try {
        stopRingtone();
        updateStatus("connecting");

        const connection = await createPeer();
        const offer = await connection.createOffer();

        await connection.setLocalDescription(offer);

        socket.emit("call:offer", {
          appointmentId,
          offer: connection.localDescription,
        }, (result) => {
          if (!result?.success) {
            setError(result?.message || "Offer send nahi hua.");
            cleanup();
          }
        });
      } catch (err) {
        setError(err.message || "Call start nahi ho saki.");
        cleanup();
      }
    }

    async function onOffer(data) {
      if (!matchesAppointment(data) || !data.offer) return;
      if (userRole !== "patient") return;

      try {
        stopRingtone();
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
        }, (result) => {
          if (!result?.success) {
            setError(result?.message || "Answer send nahi hua.");
            cleanup();
          }
        });
      } catch (err) {
        setError(err.message || "Call connect nahi hui.");
        cleanup();
      }
    }

    async function onAnswer(data) {
      if (!matchesAppointment(data) || !data.answer) return;
      if (userRole !== "doctor") return;

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

      if (data.reason === "participant_disconnected") {
        setError("Doosra participant disconnect ho gaya.");
      } else if (data.reason === "caller_disconnected") {
        setError("Doctor disconnect ho gaye.");
      } else {
        setError("Video call end ho gayi.");
      }
    }

    function onRejected(data) {
      if (!matchesAppointment(data)) return;

      cleanup();
      setError("Patient ne call reject kar di.");
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
    userRole,
    createPeer,
    flushCandidates,
    cleanup,
    updateStatus,
    playRingtone,
    stopRingtone,
    showIncomingNotification,
  ]);

  // Only doctor can start a call.
  function startCall() {
    if (userRole !== "doctor") return;

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
    if (userRole !== "patient") return;

    setError("");

    try {
      await startMedia();

      socket.emit("call:accept", { appointmentId }, (result) => {
        if (!result?.success) {
          cleanup();
          setError(result?.message || "Call accept nahi hui.");
          return;
        }

        stopRingtone();
        setIncoming(null);
        updateStatus("connecting");
      });
    } catch (err) {
      cleanup();

      setError(
        err.name === "NotAllowedError"
          ? "Camera aur microphone ki permission allow karein."
          : err.message || "Camera start nahi hua."
      );
    }
  }

  function rejectCall() {
    if (userRole !== "patient") return;

    socket?.emit("call:reject", { appointmentId }, (result) => {
      if (!result?.success) {
        setError(result?.message || "Call reject nahi hui.");
      }
    });

    cleanup();
  }

  function endCall() {
    socket?.emit("call:end", { appointmentId }, (result) => {
      if (!result?.success) {
        setError(result?.message || "Call end nahi hui.");
      }
    });

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

  const isCallVisible = [
    "calling",
    "connecting",
    "active",
  ].includes(status);
  // Attach local camera stream when video call UI appears
  useEffect(() => {
    if (!isCallVisible) return;

    const video = localVideo.current;
    const stream = localStream.current;

    if (video && stream) {
      video.srcObject = stream;

      video.play().catch((err) => {
        console.log("Local video autoplay:", err);
      });
    }
  }, [isCallVisible, status]);

  return (
    <section className="video-call-panel">
      {error && (
        <p className="video-call-error" role="alert">
          {error}
        </p>
      )}

      {/* Doctor only: compact video call button */}
      {status === "idle" && userRole === "doctor" && (
        <div className="vc-start-area">
          <button
            type="button"
            className="vc-start-button"
            onClick={startCall}
            disabled={!socket?.connected}
            title="Start video consultation"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M15 10 21 6v12l-6-4v4H3V6h12v4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
            <span>Video Call</span>
          </button>
        </div>
      )}

      {/* Patient sees only the incoming call screen when called */}
      {status === "incoming" && userRole === "patient" && (
        <div className="vc-incoming-screen">
          <div className="vc-incoming-avatar">👨‍⚕️</div>
          <p className="vc-incoming-label">Incoming Video Call</p>
          <h2>{incoming?.name || "Your Doctor"}</h2>
          <p>Your doctor is calling you...</p>

          <div className="vc-incoming-actions">
            <button
              type="button"
              className="vc-accept-button"
              onClick={acceptCall}
            >
              ✓ Accept
            </button>
            <button
              type="button"
              className="vc-reject-button"
              onClick={rejectCall}
            >
              ✕ Decline
            </button>
          </div>
        </div>
      )}

      {/* Full-screen call UI for both participants */}
      {isCallVisible && (
        <div className="vc-fullscreen">
          <video
            ref={remoteVideo}
            autoPlay
            playsInline
            className="vc-remote-video"
          />

          <div className="vc-top-bar">
            <div className="vc-call-status">
              <span className="vc-live-dot" />
              <span>
                {status === "calling"
                  ? "Calling..."
                  : status === "connecting"
                    ? "Connecting..."
                    : "Video consultation"}
              </span>
            </div>
            <span className="vc-secure-label">MedQueue</span>
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
              className={`vc-control ${muted ? "vc-disabled" : ""}`}
              onClick={toggleMic}
              title={muted ? "Unmute microphone" : "Mute microphone"}
              aria-label={muted ? "Unmute microphone" : "Mute microphone"}
            >
              {muted ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 3 21 21M9 9v3a3 3 0 0 0 5.1 2.1M15 9V5a3 3 0 0 0-6 0v1M5 10v2a7 7 0 0 0 12 4.9M12 19v3m-4 0h8" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="13" rx="3" />
                  <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" />
                </svg>
              )}
              <span>{muted ? "Unmute" : "Mute"}</span>
            </button>

            <button
              type="button"
              className={`vc-control ${cameraOff ? "vc-disabled" : ""}`}
              onClick={toggleCamera}
              title={cameraOff ? "Turn camera on" : "Turn camera off"}
              aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
            >
              {cameraOff ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m3 3 18 18M10 6h8a2 2 0 0 1 2 2v8M3 8v8a2 2 0 0 0 2 2h10M15 10l5-3v4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="6" width="14" height="12" rx="2" />
                  <path d="m16 10 6-4v12l-6-4" />
                </svg>
              )}
              <span>{cameraOff ? "Camera On" : "Camera"}</span>
            </button>

            <button
              type="button"
              className="vc-end-call"
              onClick={endCall}
              title="End call"
              aria-label="End call"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 14.5 2.5 12a2 2 0 0 1 1.1-2 18 18 0 0 1 16.8 0 2 2 0 0 1 1.1 2l-.5 2.5a2 2 0 0 1-2.8 1.4l-2.4-1.2a2 2 0 0 1-1.1-1.8v-1a13 13 0 0 0-5.4 0v1a2 2 0 0 1-1.1 1.8l-2.4 1.2A2 2 0 0 1 3 14.5Z" />
              </svg>
              <span>End</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
