// require("dotenv").config();

// const http = require("http");
// const jwt = require("jsonwebtoken");
// const { Server } = require("socket.io");
// const app = require("./app");
// const connectDB = require("./config/db");
// const User = require("./models/User");
// const { getConfirmedAppointmentForUser } = require("./utils/chatAccess");

function isPatientChatWindowExpired(appointment) {
  const start = new Date(appointment.appointmentAt || appointment.createdAt);
  if (Number.isNaN(start.getTime())) return false;
  return Date.now() >= start.getTime() + 48 * 60 * 60 * 1000;
}
// const ChatMessage = require("./models/ChatMessage");

// const PORT = process.env.PORT || 5000;
// const server = http.createServer(app);

// const allowedOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
// const io = new Server(server, {
//   cors: {
//     origin: allowedOrigin,
//     methods: ["GET", "POST"],
//   },
// });

// app.set("io", io);

// io.use(async (socket, next) => {
//   try {
//     const token = socket.handshake.auth && socket.handshake.auth.token;
//     if (!token) return next(new Error("Authentication required."));

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select("_id role name");
//     if (!user || !["patient", "doctor"].includes(user.role)) {
//       return next(new Error("Chat access denied."));
//     }

//     socket.user = user;
//     next();
//   } catch (_error) {
//     next(new Error("Invalid or expired token."));
//   }
// });

// io.on("connection", (socket) => {
//   socket.on("chat:join", async (payload, acknowledge) => {
//     const reply = typeof acknowledge === "function" ? acknowledge : () => {};
//     try {
//       const appointmentId = payload && payload.appointmentId;
//       const appointment = await getConfirmedAppointmentForUser(appointmentId, socket.user);

//       if (!appointment) {
//         return reply({
//           success: false,
//           message: "Chat sirf confirmed appointment ke patient aur doctor ke liye available hai.",
//         });
//       }

//       socket.join(`appointment:${String(appointment._id)}`);
//       reply({ success: true });
//     } catch (_error) {
//       reply({ success: false, message: "Chat room join nahi ho saka." });
//     }
//   });

//   socket.on("chat:send", async (payload, acknowledge) => {
//     const reply = typeof acknowledge === "function" ? acknowledge : () => {};
//     try {
//       const appointmentId = payload && payload.appointmentId;
//       const text = typeof (payload && payload.text) === "string"
//         ? payload.text.trim()
//         : "";

//       if (!text || text.length > 2000) {
//         return reply({ success: false, message: "Message 1 se 2000 characters ka hona chahiye." });
//       }

//       const appointment = await getConfirmedAppointmentForUser(appointmentId, socket.user);
//       if (!appointment) {
//         return reply({ success: false, message: "Is appointment ki chat access allowed nahi hai." });
//       }

//       const message = await ChatMessage.create({
//         appointment: appointment._id,
//         sender: socket.user._id,
//         text,
//       });
//       const populated = await message.populate("sender", "name role");

//       io.to(`appointment:${String(appointment._id)}`).emit("chat:message", populated);
//       reply({ success: true, messageId: String(message._id) });
//     } catch (_error) {
//       reply({ success: false, message: "Message send nahi hua. Dobara try karein." });
//     }
//   });
// });

// async function startServer() {
//   try {
//     await connectDB();
//     server.listen(PORT, () => {
//       console.log(`MedQueue server running at http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Failed to start MedQueue:", error.message);
//     process.exit(1);
//   }
// }

// startServer();






require("dotenv").config();

const http = require("http");
const jwt = require("jsonwebtoken");
const app = require("./app");
const connectDB = require("./config/db");
const { Server } = require("socket.io");
const User = require("./models/User");
const ChatMessage = require("./models/ChatMessage");
const { getConfirmedAppointmentForUser } = require("./utils/chatAccess");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

// Verify login before allowing a socket connection.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Authentication required."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("_id role name");

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
    const reply = typeof acknowledge === "function" ? acknowledge : () => {};

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
      socket.data.appointments.add(String(appointment._id));

      reply({ success: true });
    } catch {
      reply({ success: false, message: "Room join nahi ho saka." });
    }
  });

  // Existing real-time text chat.
  socket.on("chat:send", async (payload, acknowledge) => {
    const reply = typeof acknowledge === "function" ? acknowledge : () => {};

    try {
      const appointmentId = String(payload?.appointmentId || "");
      const text =
        typeof payload?.text === "string" ? payload.text.trim() : "";

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
        return reply({ success: false, message: "Chat access denied." });
      }

      if (socket.user.role === "patient" && isPatientChatWindowExpired(appointment)) {
        return reply({
          success: false,
          message: "This 48-hour follow-up chat window has ended. Please book a new appointment to consult again.",
        });
      }

      const message = await ChatMessage.create({
        appointment: appointment._id,
        sender: socket.user._id,
        text,
      });

      const populated = await message.populate("sender", "name role");

      io.to(`appointment:${appointment._id}`).emit(
        "chat:message",
        populated
      );

      reply({ success: true, messageId: String(message._id) });
    } catch {
      reply({
        success: false,
        message: "Message send nahi hua. Dobara try karein.",
      });
    }
  });

  // Verify room membership and appointment access before signaling.
  async function getAuthorizedRoom(appointmentId) {
    if (!appointmentId) return null;

    const id = String(appointmentId);

    if (!socket.data.appointments.has(id)) return null;

    const appointment = await getConfirmedAppointmentForUser(
      id,
      socket.user
    );

    return appointment ? `appointment:${appointment._id}` : null;
  }

  // Caller requests a video call.
  socket.on("call:start", async (payload, acknowledge) => {
    const reply = typeof acknowledge === "function" ? acknowledge : () => {};

    try {
      const appointmentId = String(payload?.appointmentId || "");
      const room = await getAuthorizedRoom(appointmentId);

      if (!room) {
        return reply({
          success: false,
          message: "Video call access denied.",
        });
      }

      socket.to(room).emit("call:incoming", {
        appointmentId,
        caller: {
          name: socket.user.name,
          role: socket.user.role,
        },
        from: socket.id,
      });

      reply({ success: true });
    } catch {
      reply({ success: false, message: "Call request send nahi hui." });
    }
  });

  // Forward accept, reject, offer, answer, ICE candidates and hang-up.
  const callEvents = [
    "call:accept",
    "call:reject",
    "call:offer",
    "call:answer",
    "call:ice-candidate",
    "call:end",
  ];

  for (const eventName of callEvents) {
    socket.on(eventName, async (payload = {}, acknowledge) => {
      const reply =
        typeof acknowledge === "function" ? acknowledge : () => {};

      try {
        const appointmentId = String(payload.appointmentId || "");
        const room = await getAuthorizedRoom(appointmentId);

        if (!room) {
          return reply({
            success: false,
            message: "Video call access denied.",
          });
        }

        socket.to(room).emit(eventName, {
          ...payload,
          appointmentId,
          from: socket.id,
        });

        reply({ success: true });
      } catch {
        reply({
          success: false,
          message: "Call signal send nahi ho saka.",
        });
      }
    });
  }

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

async function startServer() {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`MedQueue server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start MedQueue:", error.message);
    process.exit(1);
  }
}

startServer();



