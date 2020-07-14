import * as core from '@actions/core'
import {getToken} from './get-token'

async function run(): Promise<void> {
  try {
    const appId = core.getInput('appId')
    const installationId = core.getInput('installationId')
    const privateKey = core.getInput('privateKey')

    const {token} = getToken({appId, installationId, privateKey})

    core.setOutput('token', token)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
