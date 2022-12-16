![build-test](https://github.com/jnwng/github-app-installation-token-action/workflows/build-test/badge.svg)

# GitHub App Installation Token Action

You find yourself perusing the [GitHub Check Runs](https://docs.github.com/en/rest/reference/checks#runs) docs, thinking to yourself, "hmm, this is actually incredibly powerful! i'd love to use it.". You get down to brass tacks, and find that it is the right solution for your problem—you have an existing build system that you want to integrate with the GitHub PR flow!

In order to use GitHub Check Runs to its fullest, you need a [GitHub App](https://docs.github.com/en/developers/apps), but maintaining a webhook-driven workflow just doesn't sit right with you, especially since you know that GitHub Actions has support for [`check_run`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#check_run) events; why do I even need a webhook when I can create and manage check runs within GitHub Actions itself?

You probably find out that, hey, I can use the provided `GITHUB_TOKEN` in my Actions workflow to create my own custom checks! Yay! It looks wonderful. But how can you create a _sequence_ of checks? You realize, unfortunately, that GitHub Actions workflows cannot trigger other workflows (except when you pass a [personal access token](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#triggering-new-workflows-using-a-personal-access-token)). Awesome! I can decompose the sections of my complex workflow into their own workflows. But... check runs are made for GitHub Apps, not personal users, and thus I've caught you in my trap:

**When you want to be able to respond to `check_run` events in different GitHub Actions workflows, this is the action you need**

By providing some key information to this action, it will return you your GitHub App's [installation access token](https://docs.github.com/en/rest/reference/apps#create-an-installation-access-token-for-an-app), which you can in turn use to invoke all sort of GitHub APIs, the result of which will trigger as many GitHub Actions workflows as you might ever want. You _could_ do this some other way, it is just a lot simpler to do it this way.

## Input

| Key              |   Type   | Required | Description                                                                                                                 |
| ---------------- | :------: | :------: | --------------------------------------------------------------------------------------------------------------------------- |
| `appId`          |  `int`   |   Yes    | Your GitHub App's id                                                                                                        |
| `installationId` |  `int`   |   Yes    | The installation id of the the GitHub App in this repo / org                                                                |
| `privateKey`     | `string` |   Yes    | The private key associated to the GitHub App (typically an RSA private key)                                                 |
| `baseUrl`        | `string` |    No    | Custom base url of Github if for example self hosted in enterprise context. For example: `https://github.domain.com/api/v3` |

**Be sure to store your `privateKey` [as a secret](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) in GitHub Actions!**

## Output

This action returns the relevant installation token for use in subsequent steps, like [actions/github-script](https://github.com/actions/github-script)

| Property | Type     | Description                                                                                                                             |
| -------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `token`  | `string` | A GitHub App [installation access token](https://docs.github.com/en/rest/reference/apps#create-an-installation-access-token-for-an-app) |

## Examples

### Use in a workflow

```yml
jobs:
  createCheckRun:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - uses: ./
      id: installationToken
      with: 
        appId: 72750
        installationId: 10503340
        privateKey: ${{ secrets.GH_APP_PRIVATE_KEY }}
    - uses: actions/github-script@master
      with:
        github-token: ${{ steps.installationToken.outputs.token }}
        script: |
          await github.checks.create({
            owner: context.repo.owner,
            repo: context.repo.repo,
            name: "Installation Token Integration Test",
            head_sha: "${{ github.event.pull_request.head.sha }}",
            status: "completed",
            conclusion: "success"
          })
```

#### Note for use with `check_run`
The `GITHUB_SHA` environment variable (and in turn, the `github.sha` variable provided to the expression engine) typically refers to the last _merge_ commit on the branch (see the [`pull_request`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#pull_request) event), not the actual commit that the user would see.

**For the `pull_request` event**: use `github.event.pull_request.head.sha` for the correct SHA

**For the `push` event**: use `github.event.after` for the correct SHA

## Development

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run pack
```

Run the tests :heavy_check_mark:  
```bash
$ npm test
```

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run pack
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
