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

const addMessage = async ({ sessionId, role, content, intent, suggestedProductIds, entities }) => {
  return prisma.chatMessage.create({
    data: {
      sessionId,
      role,
      content,
      intent: intent || null,
      suggestedProductIds: suggestedProductIds || null,
      entities: entities || null,
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

const findSessionsByUser = async (userId, limit = 20) => {
  return prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      _count: { select: { messages: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true },
      },
    },
  });
};

const getSessionMessages = async (sessionId, limit = 50) => {
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

const countSessionsByUser = async (userId) => {
  return prisma.chatSession.count({ where: { userId } });
};

const deleteOldestSession = async (userId) => {
  const oldest = await prisma.chatSession.findFirst({
    where: { userId },
    orderBy: { updatedAt: "asc" },
  });
  if (oldest) {
    await prisma.chatSession.deleteMany({ where: { id: oldest.id, userId } });
  }
};

const deleteSession = async (id, userId) => {
  return prisma.chatSession.deleteMany({
    where: { id, userId },
  });
};

module.exports = {
  createSession,
  findSessionById,
  findSessionByIdForUser,
  findSessionsByUser,
  countSessionsByUser,
  deleteOldestSession,
  addMessage,
  getRecentMessages,
  getSessionMessages,
  touchSession,
  deleteSession,
};