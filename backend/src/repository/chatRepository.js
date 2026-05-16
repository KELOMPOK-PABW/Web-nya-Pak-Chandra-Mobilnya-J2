const prisma = require("../config/database");

const createSession = async ({ userId, title }) => {
  return prisma.chatSession.create({
    data: { userId, title: title || null },
  });
};

const findSessionById = async (id) => {
  return prisma.chatSession.findUnique({ where: { id } });
};

const findSessionByIdForUser = async (id, userId) => {
  return prisma.chatSession.findFirst({ where: { id, userId } });
};

const addMessage = async ({ sessionId, role, content, intent, suggestedProductIds }) => {
  return prisma.chatMessage.create({
    data: {
      sessionId,
      role,
      content,
      intent: intent || null,
      suggestedProductIds: suggestedProductIds || null,
    },
  });
};

const getRecentMessages = async (sessionId, limit = 10) => {
  const rows = await prisma.chatMessage.findMany({
    where: { sessionId },
    orderBy: { id: "desc" },
    take: limit,
  });
  return rows.reverse();
};

const touchSession = async (sessionId) => {
  return prisma.chatSession.update({
    where: { id: sessionId },
    data: { updatedAt: new Date() },
  });
};

module.exports = {
  createSession,
  findSessionById,
  findSessionByIdForUser,
  addMessage,
  getRecentMessages,
  touchSession,
};
