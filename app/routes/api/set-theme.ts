import type {ActionFunction} from '@remix-run/node';
import {json} from '@remix-run/node'
import {getTheme, setTheme} from '~/utils/theme'

export const action: ActionFunction = async ({ request }) => {
  let { theme } = await getTheme(request)
  const formData = await request.formData()
  theme = String(formData.get('theme') ?? theme)

  return json(
    {},
    {
      headers: {
        'Set-Cookie': await setTheme({ theme }),
      },
    },
  )
}
