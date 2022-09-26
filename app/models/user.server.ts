import type { Password, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import {prisma} from "~/server/db.server";
import {getUserId} from "~/server/session.server";
import dayjs from "dayjs";

export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(email: User["email"], password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

// todo check whats needed
export async function updatePassword(
  email: User["email"],
  password: string,
  newPassword: string,
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true
    }
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  const updatedUser = await prisma.user.update({
    where: {email},
    data: {
      password: {
        update: {
          hash: hashedNewPassword
        }
      }
    }
  })

  console.log("updatedUser", updatedUser);

  return updatedUser;
}


export const getUserPaymentStatus = async (request: Request) => {
  const userId = await getUserId(request)

  const userStatus = await prisma.user.findUnique(({
    where: {
      id: userId
    },
    select: {
      payment: {
        select: {
          subscriptionStatus: true
        }
      }
    }
  }))

  return userStatus?.payment?.subscriptionStatus ?? null
}

export const isUserCurrentlyPro = async (request: Request) => {
  const userId = await getUserId(request)

  const dueDate = await prisma.user.findUnique(({
    where: {
      id: userId
    },
    select: {
      payment: {
        select: {
          subscriptionEndDate: true,
          // subscriptionStatus: true,
        }
      }
    }
  }))

  return dayjs().isBefore(dayjs(dueDate?.payment?.subscriptionEndDate))

}

export const getUserPaymentData = async (request: Request) => {
  const userId = await getUserId(request)

  return await prisma.user.findUnique(({
    where: {
      id: userId
    },
    select: {
      payment: {
        select: {
          subscriptionStatus: true,
          subscriptionEndDate: true,
          subscriptionCancelUrl: true,
          subscriptionUpdateUrl: true,
        }
      }
    }
  }))
}

export const getUserPaymentTransactionsData = async (request: Request) => {
  const userId = await getUserId(request)

  return await prisma.userPaymentHistory.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        status: true,
        subscriptionPlanId: true,
        currency: true,
        amount: true,
        receiptUrl: true,
        createdAt: true,
      }
    }
  )
}

