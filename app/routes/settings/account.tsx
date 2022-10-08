import type {ActionArgs, MetaFunction} from "@remix-run/node";
import {json} from "@remix-run/node";
import {deleteFileFromS3, generateSignedUrl} from "~/models/storage.server";
import {requireUser} from "~/server/session.server";
import {deleteAvatar, updateAvatar, updatePassword, verifyLogin} from "~/models/user.server";
import {getFileKey} from "~/utils/utils";
import {AvatarUpload} from "~/components/Settings/Account/AvatarUpload";
import {ChangePassword} from "~/components/Settings/Account/ChangePassword";

export const meta: MetaFunction = () => {
  return {
    title: "Settings | Account"
  };
};

export const action = async ({request}: ActionArgs) => {
  const user = await requireUser(request)
  const {
    CLOUDFLARE_PUBLIC_FILE_URL,
  } = process.env;


  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "uploadAvatar") {
    const file = formData.get("file") as File;

    const key = `avatars/${user.id}/${Date.now()}--${file.name}`

    try {
      const signedUrl = await generateSignedUrl(file.type, key)
      await fetch(signedUrl, {method: 'PUT', body: file});
      const avatarUrl = `${CLOUDFLARE_PUBLIC_FILE_URL}/${key}`

      if (user.avatarUrl) {
        await deleteFileFromS3(getFileKey(user.avatarUrl))
      }

      await updateAvatar(user.id, avatarUrl)


      return json({success: true})
    } catch (e) {
      return json({success: false})
    }
  }

  if (intent === "deleteAvatar") {
    try {
      await deleteAvatar(user.id)

      if (user.avatarUrl) {
        await deleteFileFromS3(getFileKey(user.avatarUrl))
      }

      return json({success: true})
    } catch (e) {
      return json({success: false})
    }
  }

  if (intent === "changePassword") {
    try {
      const password = formData.get("password");
      const newPassword = formData.get("newPassword");

      // invariant(email, "Email must be set")
      // invariant(password, "Password must be set")
      // invariant(newPassword, "New password must be set")

      if (!password || !newPassword) {
        return json({intent, success: false, message: "Password and new password must be set"})
      }

      if (password === newPassword) {
        return json({intent, success: false, message: "Old and new password can't be same"})
      }

      const isValid = await verifyLogin(user.email, String(password))

      if (!isValid) {
        return json({intent, success: false, message: "Wrong old password"})
      }


      await updatePassword(user.email, String(password), String(newPassword))

      return json({intent, success: true, message: "Password updated"});

    } catch (e) {
      return json({success: false})
    }
  }

  return json({success: false})

}


export default function Account() {
  return (
    <>
      <AvatarUpload/>
      <ChangePassword/>
    </>
  )
}
