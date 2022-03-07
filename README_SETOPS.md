# Setops Deployment

## Basic Usage

The repository contains a complete [reusable workflow](https://docs.github.com/en/actions/using-workflows/reusing-workflows) that can be integrated in ci pipelines to perform a complete setops deployment via

```yaml
name: Deployment
on: push

jobs:
  setops-stages:
    name: Detect setops stages based on the current branch
    runs-on: ubuntu-latest
    outputs:
      stages: ${{ steps.stages.outputs.stages }}
    if: github.ref == 'refs/heads/production' || github.ref == 'refs/heads/staging'
    steps:
      - name: "Detect setops stages based on the current branch"
        id: stages
        run: |
          if [ "$GITHUB_REF" == "refs/heads/staging" ]; then
            echo '::set-output name=stages::["staging"]'
          elif [ "$GITHUB_REF" == "refs/heads/production" ]; then
            echo '::set-output name=stages::["production"]'
          else
            echo "⚠️ Could not determine stages for $GITHUB_REF"
            exit 1
          fi

  setops-deployment:
    uses: zweitag/github-actions/.github/workflows/setops-deployment-workflow.yml@setops-v2
    with:
      stages: ${{ needs.setops-stages.outputs.stages }}
      apps: '["web", "clock", "worker"]'
      setops-project: my_setops_project_name
      predeploy-command: bin/rails db:migrate
    secrets:
      setops-username: ${{ secrets.SETOPS_USER }}
      setops-password: ${{ secrets.SETOPS_PASSWORD }}
```

This workflow

* Builds a docker image based on the `Dockerfile` in the project's root folder and pushes it to the setops registry
* Deploys the image to every app configured in `apps`. If you configure more than one stage in `stages`, the workflow will deploy each stage in parallel

CAUTION: The script assumes a configured healthcheck for *all* apps.

See the [workflow file](.github/workflows/setops-deployment-workflow.yml) for all possible inputs

## Building blocks

The workflow consists of a small workflow file that calls two separate Github Actions which can also be included separately your Github Workflow.

### Action: `setops-build-and-push-image`

The action builds the image and pushes it to the setops registry which all needed tags (one for each stage / app - combination). It also tries to provide a Docker cache. The cache key contains the current date. This way, we want to make subsequent deploys within one day faster; however we always want to have the newest (security) updates of the used distro and packages.

You can also use the action without the workflow:

```yaml
jobs:
  build:
    name: Build and push image
    runs-on: ubuntu-latest
    outputs:
      image-digest: ${{ steps.build_and_push_image.outputs.image-digest }}
    steps:
      - name: "Checkout repository"
        uses: actions/checkout@v2
      - name: "Build image and push it to setops image registry"
        id: build_and_push_image
        uses: zweitag/github-actions/setops-build-and-push-image@setops-v2
        with:
          stages: ${{ needs.setops-stages.outputs.stages }}
          apps: '["web", "clock", "worker"]'
          setops-username: ${{ secrets.SETOPS_USER }}
          setops-password: ${{ secrets.SETOPS_PASSWORD }}
          setops-project: my_setops_project_name
```

See the [action file](setops-build-and-push-image/action.yml) for all possible inputs

### Action: `setops-deployment`

The action

* Creates releases for all configured apps
* Runs the predeploy command within the first of the configured apps
* Activates all releases
* Waits until all releases are healthy

You can also use the action without the workflow:

```yaml
 deploy:
    name: Setops Deployment
    strategy:
      fail-fast: false
    concurrency: setops-deployment-${{ github.ref }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: "Checkout repository"
        uses: actions/checkout@v2
      - name: "Deploy project on setops"
        id: deploy
        uses: zweitag/github-actions/setops-deployment@setops-v2
        with:
          stage: production
          apps: ${{ inputs.apps }}
          setops-project: my_setops_project_name
          setops-username: ${{ secrets.SETOPS_USER }}
          setops-password: ${{ secrets.SETOPS_PASSWORD }}
          image-digest: ${{ needs.build.outputs.image-digest }}
          predeploy-command: bin/rails db:migrate
```

See the [action file](setops-deployment/action.yml) for all possible inputs
