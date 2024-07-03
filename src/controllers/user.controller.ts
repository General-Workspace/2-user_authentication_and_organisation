import prisma from "../config/prisma.config";

export const findUsers = () => {
  //   find all users
  const allUsers = prisma.user.findMany();

  console.log(allUsers);
};
