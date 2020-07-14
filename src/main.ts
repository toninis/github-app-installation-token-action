import {Octokit} from '@octokit/rest'
import {AppsCreateInstallationAccessTokenResponseData} from '@octokit/types'
import {createAppAuth} from '@octokit/auth-app'
import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const appId = core.getInput('appId')
    const installationId = core.getInput('installationId')
    const privateKey = core.getInput('privateKey')
    const octokit = new Octokit({
      authStrategy: createAppAuth,
      auth: {
        id: appId,
        privateKey
      }
    })

    const {token} = (await octokit.auth({
      type: 'installation',
      installationId
    })) as AppsCreateInstallationAccessTokenResponseData

    core.setOutput('token', token)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
