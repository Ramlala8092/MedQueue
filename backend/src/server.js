

require("dotenv").config();

const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");
const connectDB = require("./config/db");
const { Server } = require("socket.io");
const User = require("./models/User");
const ChatMessage = require("./models/ChatMessage");
const { getConfirmedAppointmentForUser } = require("./utils/chatAccess");
const { isPatientChatWindowExpired } = require("./routes/chatRoutes");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const allowedOrigins = (
  process.env.CLIENT_ORIGIN || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// Active video call sessions, keyed by appointment ID.
const callSessions = new Map();

// Verify login before allowing a socket connection.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select(
      "_id role name"
    );

    if (!user || !["patient", "doctor"].includes(user.role)) {
      return next(new Error("Chat access denied."));
    }

    socket.user = user;
    next();
  } catch {
    next(new Error("Invalid or expired token."));
  }
});

io.on("connection", (socket) => {
  console.log("Authenticated socket:", socket.id);

  socket.data.appointments = new Set();

  // Join only a confirmed appointment belonging to this user.
  socket.on("chat:join", async (payload, acknowledge) => {
    const reply =
      typeof acknowledge === "function" ? acknowledge : () => { };

    try {
      const appointmentId = payload?.appointmentId;

      const appointment = await getConfirmedAppointmentForUser(
        appointmentId,
        socket.user
      );

      if (!appointment) {
        return reply({
          success: false,
          message: "Confirmed appointment access required.",
        });
      }

      const room = `appointment:${appointment._id}`;

      await socket.join(room);

      console.log("CHAT ROOM JOINED:", {
        userId: String(socket.user._id),
        role: socket.user.role,
        appointmentId: String(appointment._id),
        room,
        socketId: socket.id,
      });

      socket.data.appointments.add(String(appointment._id));

      reply({ success: true });
    } catch {
      reply({
        success: false,
        message: "Room join nahi ho saka.",
      });
    }
  });

  // Existing real-time text chat.
  socket.on("chat:send", async (payload, acknowledge) => {
    const reply =
      typeof acknowledge === "function" ? acknowledge : () => { };

    try {
      const appointmentId = String(payload?.appointmentId || "");

      const text =
        typeof payload?.text === "string"
          ? payload.text.trim()
          : "";

      if (!text || text.length > 2000) {
        return reply({
          success: false,
          message: "Message 1 se 2000 characters ka hona chahiye.",
        });
      }

      if (!socket.data.appointments.has(appointmentId)) {
        return reply({
          success: false,
          message: "Pehle authorized chat room join karein.",
        });
      }

      const appointment = await getConfirmedAppointmentForUser(
        appointmentId,
        socket.user
      );

      if (!appointment) {
        return reply({
          success: false,
          message: "Chat access denied.",
        });
      }

      if (
        socket.user.role === "patient" &&
        isPatientChatWindowExpired(appointment)
      ) {
        return reply({
          success: false,
          message:
            "This 48-hour follow-up chat window has ended. Please book a new appointment to consult again.",
        });
      }

      const message = await ChatMessage.create({
        appointment: appointment._id,
        sender: socket.user._id,
        text,
      });

      const populated = await message.populate(
        "sender",
        "name role"
      );

      io.to(`appointment:${appointment._id}`).emit(
        "chat:message",
        populated
      );

      reply({
        success: true,
        messageId: String(message._id),
      });
    } catch {
      reply({
        success: false,
        message: "Message send nahi hua. Dobara try karein.",
      });
    }
  });

  // Verify appointment membership and access.
  async function getAuthorizedRoom(appointmentId) {
    if (!appointmentId) return null;

    const id = String(appointmentId);

    if (!socket.data.appointments.has(id)) {
      return null;
    }

    const appointment = await getConfirmedAppointmentForUser(
      id,
      socket.user
    );

    return appointment
      ? `appointment:${appointment._id}`
      : null;
  }

  // =====================================================
  // VIDEO CALL EVENTS
  // Only the doctor can initiate a video call.
  // =====================================================

  // Doctor starts the call.
  socket.on("call:start", async (payload, acknowledge) => {
    const reply =
      typeof acknowledge === "function" ? acknowledge : () => { };

    try {
      if (socket.user.role !== "doctor") {
        return reply({
          success: false,
          message: "Only the doctor can start a video call.",
        });
      }

      const appointmentId = String(
        payload?.appointmentId || ""
      );

      const room = await getAuthorizedRoom(appointmentId);

      console.log("CALL START:", {
        userId: String(socket.user._id),
        role: socket.user.role,
        appointmentId,
        room,
        socketId: socket.id,
        connected: socket.connected,
      });

      console.log("CALL ROOM CHECK:", {
        appointmentId,
        authorized: Boolean(room),
        joinedAppointments: [...socket.data.appointments],
      });
      if (!room) {
        return reply({
          success: false,
          message: "Video call access denied.",
        });
      }

      if (callSessions.has(appointmentId)) {
        return reply({
          success: false,
          message: "A call is already in progress or ringing.",
        });
      }

      const session = {
        appointmentId,
        doctorSocketId: socket.id,
        patientSocketId: null,
        status: "ringing",
      };

      callSessions.set(appointmentId, session);

      // Notify the other participant about the incoming call.
      socket.to(room).emit("call:incoming", {
        appointmentId,
        caller: {
          name: socket.user.name,
          role: "doctor",
        },
        from: socket.id,
      });

      reply({ success: true });
    } catch (error) {
      console.error("Call start error:", error);

      reply({
        success: false,
        message: "Call request send nahi hui.",
      });
    }
  });

  // Patient accepts the incoming call.
  socket.on("call:accept", async (payload, acknowledge) => {
    const reply =
      typeof acknowledge === "function" ? acknowledge : () => { };

    try {
      if (socket.user.role !== "patient") {
        return reply({
          success: false,
          message: "Only the patient can accept the incoming call.",
        });
      }

      const appointmentId = String(
        payload?.appointmentId || ""
      );

      const room = await getAuthorizedRoom(appointmentId);

      if (!room) {
        return reply({
          success: false,
          message: "Video call access denied.",
        });
      }

      const session = callSessions.get(appointmentId);

      if (!session || session.status !== "ringing") {
        return reply({
          success: false,
          message: "This call is no longer available.",
        });
      }

      session.patientSocketId = socket.id;
      session.status = "accepted";

      // Notify only the doctor who initiated this call.
      io.to(session.doctorSocketId).emit("call:accept", {
        appointmentId,
        from: socket.id,
      });

      reply({ success: true });
    } catch (error) {
      console.error("Call accept error:", error);

      reply({
        success: false,
        message: "Call accept nahi hui.",
      });
    }
  });

  // Patient rejects the incoming call.
  socket.on("call:reject", async (payload, acknowledge) => {
    const reply =
      typeof acknowledge === "function" ? acknowledge : () => { };

    try {
      if (socket.user.role !== "patient") {
        return reply({
          success: false,
          message: "Only the patient can reject the incoming call.",
        });
      }

      const appointmentId = String(
        payload?.appointmentId || ""
      );

      const room = await getAuthorizedRoom(appointmentId);

      if (!room) {
        return reply({
          success: false,
          message: "Video call access denied.",
        });
      }

      const session = callSessions.get(appointmentId);

      if (
        !session ||
        session.status !== "ringing"
      ) {
        return reply({
          success: false,
          message: "No incoming call found.",
        });
      }

      io.to(session.doctorSocketId).emit("call:reject", {
        appointmentId,
        from: socket.id,
      });

      callSessions.delete(appointmentId);

      reply({ success: true });
    } catch (error) {
      console.error("Call reject error:", error);

      reply({
        success: false,
        message: "Call reject nahi ho saki.",
      });
    }
  });

  // Doctor sends WebRTC offer after patient accepts.
  socket.on("call:offer", async (payload, acknowledge) => {
    const reply =
      typeof acknowledge === "function" ? acknowledge : () => { };

    try {
      if (socket.user.role !== "doctor") {
        return reply({
          success: false,
          message: "Only the doctor can send the call offer.",
        });
      }

      const appointmentId = String(
        payload?.appointmentId || ""
      );

      const room = await getAuthorizedRoom(appointmentId);

      if (!room) {
        return reply({
          success: false,
          message: "Video call access denied.",
        });
      }

      const session = callSessions.get(appointmentId);

      if (
        !session ||
        session.status !== "accepted" ||
        session.doctorSocketId !== socket.id ||
        !session.patientSocketId ||
        !payload?.offer
      ) {
        return reply({
          success: false,
          message: "Invalid video call offer.",
        });
      }

      io.to(session.patientSocketId).emit("call:offer", {
        appointmentId,
        offer: payload.offer,
        from: socket.id,
      });

      reply({ success: true });
    } catch (error) {
      console.error("Call offer error:", error);

      reply({
        success: false,
        message: "Call offer send nahi hua.",
      });
    }
  });

  // Patient sends WebRTC answer.
  socket.on("call:answer", async (payload, acknowledge) => {
    const reply =
      typeof acknowledge === "function" ? acknowledge : () => { };

    try {
      if (socket.user.role !== "patient") {
        return reply({
          success: false,
          message: "Only the patient can send the call answer.",
        });
      }

      const appointmentId = String(
        payload?.appointmentId || ""
      );

      const room = await getAuthorizedRoom(appointmentId);

      if (!room) {
        return reply({
          success: false,
          message: "Video call access denied.",
        });
      }

      const session = callSessions.get(appointmentId);

      if (
        !session ||
        session.status !== "accepted" ||
        session.patientSocketId !== socket.id ||
        !payload?.answer
      ) {
        return reply({
          success: false,
          message: "Invalid video call answer.",
        });
      }

      io.to(session.doctorSocketId).emit("call:answer", {
        appointmentId,
        answer: payload.answer,
        from: socket.id,
      });

      reply({ success: true });
    } catch (error) {
      console.error("Call answer error:", error);

      reply({
        success: false,
        message: "Call answer send nahi hua.",
      });
    }
  });

  // Exchange ICE candidates between the two call participants.
  socket.on(
    "call:ice-candidate",
    async (payload, acknowledge) => {
      const reply =
        typeof acknowledge === "function"
          ? acknowledge
          : () => { };

      try {
        const appointmentId = String(
          payload?.appointmentId || ""
        );

        const room = await getAuthorizedRoom(appointmentId);

        if (!room) {
          return reply({
            success: false,
            message: "Video call access denied.",
          });
        }

        const session = callSessions.get(appointmentId);

        if (!session || session.status !== "accepted") {
          return reply({
            success: false,
            message: "No active call found.",
          });
        }

        let targetSocketId = null;

        if (session.doctorSocketId === socket.id) {
          targetSocketId = session.patientSocketId;
        } else if (session.patientSocketId === socket.id) {
          targetSocketId = session.doctorSocketId;
        }

        if (!targetSocketId || !payload?.candidate) {
          return reply({
            success: false,
            message: "Invalid call participant or ICE candidate.",
          });
        }

        io.to(targetSocketId).emit("call:ice-candidate", {
          appointmentId,
          candidate: payload.candidate,
          from: socket.id,
        });

        reply({ success: true });
      } catch (error) {
        console.error("ICE candidate error:", error);

        reply({
          success: false,
          message: "ICE candidate send nahi hua.",
        });
      }
    }
  );

  // Either participant can end an accepted call.
  socket.on("call:end", async (payload, acknowledge) => {
    const reply =
      typeof acknowledge === "function" ? acknowledge : () => { };

    try {
      const appointmentId = String(
        payload?.appointmentId || ""
      );

      const room = await getAuthorizedRoom(appointmentId);

      if (!room) {
        return reply({
          success: false,
          message: "Video call access denied.",
        });
      }

      const session = callSessions.get(appointmentId);

      if (!session) {
        return reply({
          success: false,
          message: "No active call found.",
        });
      }

      let targetSocketId = null;

      if (session.doctorSocketId === socket.id) {
        targetSocketId = session.patientSocketId;
      } else if (session.patientSocketId === socket.id) {
        targetSocketId = session.doctorSocketId;
      }

      if (!targetSocketId) {
        return reply({
          success: false,
          message: "You are not a participant in this call.",
        });
      }

      io.to(targetSocketId).emit("call:end", {
        appointmentId,
        from: socket.id,
      });

      callSessions.delete(appointmentId);

      reply({ success: true });
    } catch (error) {
      console.error("Call end error:", error);

      reply({
        success: false,
        message: "Call end nahi ho saki.",
      });
    }
  });

  // Clean up an active call if a participant disconnects.
  socket.on("disconnect", () => {
    for (const [appointmentId, session] of callSessions.entries()) {
      let otherSocketId = null;

      if (session.doctorSocketId === socket.id) {
        otherSocketId = session.patientSocketId;
      } else if (session.patientSocketId === socket.id) {
        otherSocketId = session.doctorSocketId;
      }

      if (otherSocketId) {
        io.to(otherSocketId).emit("call:end", {
          appointmentId,
          reason: "participant_disconnected",
        });

        callSessions.delete(appointmentId);
      } else if (
        session.doctorSocketId === socket.id &&
        session.status === "ringing"
      ) {
        // The doctor disconnected before the patient accepted.
        io.to(`appointment:${appointmentId}`).emit("call:end", {
          appointmentId,
          reason: "caller_disconnected",
        });

        callSessions.delete(appointmentId);
      }
    }

    console.log("Socket disconnected:", socket.id);
  });
});

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(
        `MedQueue server running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start MedQueue:", error.message);
    process.exit(1);
  }
}

startServer();