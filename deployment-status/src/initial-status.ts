import * as core from "@actions/core";
import * as github from "@actions/github";
import {
  updateStatus,
  DeploymentState,
  DeploymentEnvironment,
} from "./update-status";
import { State } from "./constats";

async function run() {
  try {
    const context = github.context;
    const token = core.getInput("token", { required: true });
    const logUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`;
    const status =
      (core.getInput("initial_status", {
        required: false,
      }) as DeploymentState) || "pending";
    const environment =
      (core.getInput("environment", {
        required: false,
      }) as DeploymentEnvironment) || "production";
    const ref = core.getInput("ref", { required: false }) || context.ref;
    const environmentUrl = core.getInput("environment_url", {
      required: false,
    });

    const statusUpdateData = await updateStatus(status, {
      environment: environment,
      target_url: logUrl,
      environment_url: environmentUrl,
      owner: context.repo.owner,
      ref: ref,
      repo: context.repo.repo,
      sha: context.sha,
      token: token,
    });

    core.saveState(State.StatusUpdateData, statusUpdateData);

    core.setOutput("deployment_id", statusUpdateData.deployment_id);
  } catch (err: any) {
    if (err instanceof Error) {
      core.error(err);
      core.setFailed(err.message);
    } else {
      core.error(err.toString());
      core.setFailed(err.toString());
    }
  }
}

run();
