



import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import VideoCall from "../component/VideoCall";
import "./ChatPage.css";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;
const SOCKET_URL = import.meta.env.VITE_API_URL;

export default function ChatPage() {
  const { appointmentId } = useParams();

  const [messages, setMessages] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [clockNow, setClockNow] = useState(Date.now());
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const photosRef = useRef(photos);

  const token = localStorage.getItem("token");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  // Patient chat is locked 48 hours after the appointment start time.
  // Doctors are not restricted by this frontend condition.
  const chatStartTime = appointment
    ? new Date(
      appointment.appointmentAt || appointment.createdAt
    ).getTime()
    : NaN;

  const isPatientChatLocked =
    user?.role === "patient" &&
    Number.isFinite(chatStartTime) &&
    clockNow >= chatStartTime + 48 * 60 * 60 * 1000;

  const loadMessages = useCallback(async () => {
    if (!token) {
      setError("Chat use karne ke liye login karein.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/chat/${appointmentId}/messages`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Chat load nahi hui.");
      }

      setMessages(Array.isArray(data.messages) ? data.messages : []);
      if (data.appointment) setAppointment(data.appointment);
      // Loading history marks the messages from the other participant as read.
      await fetch(`${API_BASE}/chat/${appointmentId}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setError("");
    } catch (err) {
      setError(err.message || "Chat load nahi hui.");
    } finally {
      setLoading(false);
    }
  }, [appointmentId, token]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);


  useEffect(() => {
    const intervalId = setInterval(() => {
      setClockNow(Date.now());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!token || !appointmentId) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);

      socket.emit("chat:join", { appointmentId }, (result) => {
        if (!result?.success) {
          setError(result?.message || "Chat access nahi mil saka.");
        } else {
          setError("");
        }
      });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      setConnected(false);
      setError(
        err.message || "Chat server se connection nahi ho raha."
      );
    });

    socket.on("chat:message", (message) => {
      const messageAppointment =
        message.appointment?._id || message.appointment;

      if (
        String(messageAppointment) !== String(appointmentId)
      ) {
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item._id === message._id)) {
          return current;
        }

        return [...current, message];
      });
      if (String(message.sender?._id || message.sender) !== String(user?.id || user?._id)) {
        fetch(`${API_BASE}/chat/${appointmentId}/read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => { });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [appointmentId, token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    let active = true;

    async function loadPhotos() {
      const imageMessages = messages.filter(
        (message) =>
          message.imageFilename && !photos[message._id]
      );

      if (!token || imageMessages.length === 0) return;

      const loaded = {};

      await Promise.all(
        imageMessages.map(async (message) => {
          try {
            const response = await fetch(
              `${API_BASE}/chat/messages/${message._id}/photo`,
              {
                headers: {
                  Authorization: "Bearer " + token,
                },
              }
            );

            if (!response.ok) return;

            const url = URL.createObjectURL(
              await response.blob()
            );

            loaded[message._id] = url;
          } catch {
            // Photo load fail hone par chat chalti rahegi.
          }
        })
      );

      if (active && Object.keys(loaded).length > 0) {
        setPhotos((current) => ({
          ...current,
          ...loaded,
        }));
      }
    }

    loadPhotos();

    return () => {
      active = false;
    };
  }, [messages, token, photos]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      Object.values(photosRef.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  async function sendMessage(event) {
    event.preventDefault();

    const cleanText = text.trim();

    if (isPatientChatLocked) return;

    if (
      !cleanText ||
      !socketRef.current?.connected ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    socketRef.current.emit(
      "chat:send",
      {
        appointmentId,
        text: cleanText,
      },
      (result) => {
        setSending(false);

        if (!result?.success) {
          setError(
            result?.message || "Message send nahi hua."
          );
          return;
        }

        setText("");
      }
    );
  }

  async function sendPhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;
    if (isPatientChatLocked) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      setError("Sirf JPG, PNG ya WEBP photo select karein.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Photo maximum 5 MB ki ho sakti hai.");
      return;
    }

    setSending(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await fetch(
        `${API_BASE}/chat/${appointmentId}/photo`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + (token || ""),
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Photo upload nahi hui."
        );
      }

      setNotice("Photo chat mein bhej di gayi.");
      await loadMessages();
    } catch (err) {
      setError(err.message || "Photo upload nahi hui.");
    } finally {
      setSending(false);
    }
  }

  if (user?.role !== "patient" && user?.role !== "doctor") {
    return (
      <main className="chat-page">
        <div className="chat-access-card">
          <h1>MedQueue Chat</h1>
          <p>
            Chat use karne ke liye patient ya doctor account
            se login karein.
          </p>
          <Link to="/login">Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-page">
      <section className="chat-panel">
        <header className="chat-header">
          <div>
            <Link
              className="chat-back-link"
              to={
                user.role === "doctor"
                  ? "/doctor/dashboard"
                  : "/patient/dashboard"
              }
            >
              ← Dashboard
            </Link>

            <h1>Patient–Doctor Chat</h1>
            {/* <p>
              Appointment ke baare mein secure conversation
            </p> */}
          </div>

          <span
            className={
              "chat-connection " +
              (connected ? "is-online" : "")
            }
          >
            {connected ? "Connected" : "Connecting..."}
          </span>
        </header>

        <div className="chat-notice">
          Health emergency mein chat ka intezar na karein.
          Photos sirf JPG, PNG ya WEBP hon aur 5 MB se
          chhoti hon.
        </div>

        {isPatientChatLocked && (
          <div className="chat-notice" role="status">
            This 48-hour follow-up chat window has ended. Please book a new appointment to consult again.
          </div>
        )}

        {error && <p className="chat-error">{error}</p>}
        {notice && (
          <p className="chat-success">{notice}</p>
        )}

        {/* New video call section */}
        <VideoCall
          socket={connected ? socketRef.current : null}
          appointmentId={appointmentId}
          userRole={user?.role}
        />

        {/* Existing messages remain unchanged */}
        <div className="chat-messages" aria-live="polite">
          {loading ? (
            <p className="chat-empty">
              Messages load ho rahe hain...
            </p>
          ) : messages.length === 0 ? (
            <p className="chat-empty">
              Abhi koi message nahi hai. Conversation shuru
              karein.
            </p>
          ) : (
            messages.map((message) => {
              const mine =
                String(
                  message.sender?._id || message.sender
                ) ===
                String(user?.id || user?._id);

              return (
                <article
                  className={
                    "chat-message " +
                    (mine ? "mine" : "theirs")
                  }
                  key={message._id}
                >
                  <span className="chat-sender">
                    {mine
                      ? "You"
                      : message.sender?.name || "Participant"}
                  </span>

                  {message.text && <p>{message.text}</p>}

                  {message.imageFilename &&
                    (photos[message._id] ? (
                      <a
                        href={photos[message._id]}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img
                          className="chat-photo"
                          src={photos[message._id]}
                          alt="Patient shared medical image"
                        />
                      </a>
                    ) : (
                      <span className="chat-photo-loading">
                        Photo load ho rahi hai...
                      </span>
                    ))}

                  <time>
                    {new Date(
                      message.createdAt
                    ).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </article>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        {/* Existing text and photo composer */}
        <form
          className="chat-compose"
          onSubmit={sendMessage}
        >
          <label className="chat-photo-button">
            <span aria-hidden="true">＋</span> Photo

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={sendPhoto}
              disabled={sending || !connected || isPatientChatLocked}
            />
          </label>

          <input
            type="text"
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Apna message likhein..."
            maxLength={2000}
            aria-label="Message"
            disabled={!connected || sending || isPatientChatLocked}
          />

          <button
            type="submit"
            disabled={
              !text.trim() || !connected || sending || isPatientChatLocked
            }
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </form>
      </section>
    </main>
  );
}




