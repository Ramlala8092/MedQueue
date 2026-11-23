
const QueueCounter = require("../models/QueueCounter");

// Convert appointment date into Indian calendar date.
const getQueueDate = (appointmentAt) => {
    const date = new Date(appointmentAt);

    if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid appointment date for queue token.");
    }

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);

    const dateParts = {};

    for (const part of parts) {
        if (part.type !== "literal") {
            dateParts[part.type] = part.value;
        }
    }

    return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

// Atomically allocate the next token for one doctor and one date.
const allocateQueueToken = async (doctorId, appointmentAt) => {
    if (!doctorId) {
        throw new Error("Doctor ID is required to generate a queue token.");
    }

    const queueDate = getQueueDate(appointmentAt);

    // Retry if two requests try to create the first counter simultaneously.
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const counter = await QueueCounter.findOneAndUpdate(
                {
                    doctor: doctorId,
                    queueDate,
                },
                {
                    $inc: { lastTokenNumber: 1 },
                    $setOnInsert: {
                        doctor: doctorId,
                        queueDate,
                    },
                },
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                }
            );

            return {
                tokenNumber: counter.lastTokenNumber,
                queueDate,
            };
        } catch (error) {
            // A concurrent first-time insert can hit the unique index.
            if (error.code === 11000 && attempt < 3) {
                continue;
            }

            throw error;
        }
    }

    throw new Error("Unable to allocate queue token.");
};

module.exports = {
    getQueueDate,
    allocateQueueToken,
};
