import {Octokit} from '@octokit/rest'
import {request as Request} from '@octokit/request'
import {
  AppsCreateInstallationAccessTokenResponseData,
  RequestRequestOptions
} from '@octokit/types'
import {createAppAuth} from '@octokit/auth-app'

interface GetTokenInput {
  appId: number
  installationId: number
  privateKey: string
}

export async function getToken(
  {appId, installationId, privateKey}: GetTokenInput,
  request: RequestRequestOptions = Request
): Promise<{token: string}> {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      id: appId,
      privateKey
    },
    request
  })

  const {token} = (await octokit.auth({
    type: 'installation',
    installationId
  })) as AppsCreateInstallationAccessTokenResponseData

  return {token}
}
