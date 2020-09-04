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
    const defaultLogUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`;
    const status =
      (core.getInput("initial_status", {
        required: false,
      }) as DeploymentState) || "pending";
    const environment =
      (core.getInput("environment", {
        required: false,
      }) as DeploymentEnvironment) || "production";
    const ref = core.getInput("ref", { required: false }) || context.ref;
    const logUrl = core.getInput("link", { required: false }) || defaultLogUrl;

    const statusUpdateData = await updateStatus(status, {
      environment: environment,
      log_url: logUrl,
      owner: context.repo.owner,
      ref: ref,
      repo: context.repo.repo,
      sha: context.sha,
      token: token,
    });

    core.saveState(State.StatusUpdateData, statusUpdateData);

    core.setOutput("deployment_id", statusUpdateData.deployment_id);
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
