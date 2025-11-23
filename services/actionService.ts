import prisma from "../lib/prisma";

export async function createAction(data: {
  name: string;
  url: string;
  method: string;
}) {
  return prisma.action.create({ data });
}

export async function listActions() {
  return prisma.action.findMany({ orderBy: { id: "asc" } });
}

export async function updateAction(id: number, data: Record<string, any>) {
  return prisma.action.update({ where: { id }, data });
}

export async function findAction(id: number) {
  return prisma.action.findUnique({
    where: { id },
  });
}
