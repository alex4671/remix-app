import type {Password, User} from "@prisma/client";
import bcrypt from "bcryptjs";
import {prisma} from "~/server/db.server";
import {getUserId, requireUserId} from "~/server/session.server";
import dayjs from "dayjs";
import {sign, verify} from "jsonwebtoken";

interface InviteToken {
  userId: string
}

interface ResetToken {
  email: string
}

// todo move to env
export const APP_SECRET = 'appsecret321'


export type { User } from "@prisma/client";

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      payment: true
    }
  });
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

export async function resetPassword(email: User["email"], newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  return prisma.user.update({
    where: {
      email
    },
    data: {
      password: {
        update: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function deleteUserById(id: User["id"]) {
  return prisma.user.delete({ where: { id } });
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

export async function updateAvatar(id: User["id"], avatarUrl: User["avatarUrl"]) {
  return prisma.user.update({
    where: { id },
    data: { avatarUrl }
  });
}

export async function deleteAvatar(id: User["id"]) {
  return prisma.user.update({
    where: {id},
    data: {
      avatarUrl: null
    }
  })
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

  return prisma.userPaymentHistory.findMany({
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

export const generateInviteLink = async (url: string, userId: string): Promise<string> => {
  const token = sign({userId}, APP_SECRET)

  const {origin} = new URL(url)

  return `${origin}/cb/invite/${token}`
}

export const validateInviteLink = async (request: Request, token: string): Promise<boolean> => {
  const userId = await requireUserId(request)

  const verifiedToken = verify(token, APP_SECRET) as InviteToken

  const isVerified = verifiedToken.userId === userId

  if (isVerified) {
    await confirmUserEmail(userId)
  }

  return isVerified;
}

export const generateResetToken = async (url: string, email: string): Promise<string> => {
  const token = sign({email}, APP_SECRET)

  const {origin} = new URL(url)

  return `${origin}/cb/reset/${token}`
}

export const validateResetToken = async (token: string): Promise<string | undefined> => {
  const verifiedToken = verify(token, APP_SECRET) as ResetToken

  const user = await getUserByEmail(verifiedToken.email)

  return user?.email;


}

const confirmUserEmail = (userId: string) => {
  return prisma.user.update({
    where: {
      id: userId
    },
    data: {
      isConfirmed: true
    }
  })
}

export const isUserConfirmed = async (request: Request) => {
  const userId = await requireUserId(request)

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      isConfirmed: true
    }
  })

  return user?.isConfirmed
}
