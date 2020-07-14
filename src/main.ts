import * as core from '@actions/core'
import {getToken} from './get-token'

async function run(): Promise<void> {
  try {
    const appId = parseInt(core.getInput('appId'), 10)
    const installationId = parseInt(core.getInput('installationId'), 10)
    const privateKey = core.getInput('privateKey')

    const {token} = await getToken({appId, installationId, privateKey})

    core.setOutput('token', token)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
