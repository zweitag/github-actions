import * as github from "@actions/github";

export type DeploymentState =
  | "error"
  | "failure"
  | "inactive"
  | "in_progress"
  | "queued"
  | "pending"
  | "success";

export type DeploymentEnvironment = "production" | "staging" | "qa" | undefined;

export interface StatusUpdateData {
  token: string;
  owner: string;
  repo: string;
  ref: string;
  sha: string;
  log_url: string;
  target_url: string;
  environment: DeploymentEnvironment;
  environment_url: string;
  deployment_id?: number;
}

export const updateStatus = async (
  status: DeploymentState,
  data: StatusUpdateData
): Promise<StatusUpdateData> => {
  const client = github.getOctokit(data.token);

  var deployment_id;

  if (!data.deployment_id) {
    const deployment = await client.repos.createDeployment({
      ...data,
      required_contexts: [],
      transient_environment: true,
    });

    if ("id" in deployment.data) {
      deployment_id = deployment.data.id;
    } else {
      throw (
        "Deployment could not be created: " + JSON.stringify(deployment.data)
      );
    }
  } else {
    deployment_id = data.deployment_id;
  }

  await client.repos.createDeploymentStatus({
    ...data,
    deployment_id: deployment_id,
    state: status,
  });

  return {
    ...data,
    deployment_id: deployment_id,
  };
};
