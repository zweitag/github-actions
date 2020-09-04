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
  deployment_id?: number;
  environment: DeploymentEnvironment;
  log_url: string;
  target_url: string;
  environment_url: string;
  owner: string;
  ref: string;
  repo: string;
  sha: string;
  token: string;
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
