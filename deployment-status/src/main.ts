import * as core from "@actions/core";
import * as github from "@actions/github";
import { updateStatus } from "./update-status";
import { State } from "./constats";

type DeploymentState =
  | "error"
  | "failure"
  | "inactive"
  | "in_progress"
  | "queued"
  | "pending"
  | "success";

async function run() {
  try {
    const context = github.context;
    const logUrl = `https://github.com/${context.repo.owner}/${context.repo.repo}/commit/${context.sha}/checks`;
    const status =
      (core.getInput("initial_status", { required: false }) as DeploymentState) ||
      "pending";

    const statusUpdateData = await updateStatus(status, {
      token: core.getInput("token", { required: true }),
      owner: context.repo.owner,
      repo: context.repo.repo,
      sha: context.sha,
      ref: context.ref,
      log_url: logUrl,
      environment_url:
        core.getInput("environment_url", { required: false }) || logUrl,
      target_url: logUrl,
    });

    core.saveState(State.StatusUpdateData, statusUpdateData);

    core.setOutput("deployment_id", statusUpdateData.deployment_id);
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
