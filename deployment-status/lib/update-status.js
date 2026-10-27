import * as github from "@actions/github";
export const updateStatus = async (status, data) => {
    const client = github.getOctokit(data.token);
    var deployment_id;
    if (!data.deployment_id) {
        const deployment = await client.rest.repos.createDeployment({
            ...data,
            auto_merge: false,
            required_contexts: [],
            transient_environment: true,
        });
        if ("id" in deployment.data) {
            deployment_id = deployment.data.id;
        }
        else {
            throw ("Deployment could not be created: " + JSON.stringify(deployment.data));
        }
    }
    else {
        deployment_id = data.deployment_id;
    }
    await client.rest.repos.createDeploymentStatus({
        ...data,
        deployment_id: deployment_id,
        state: status,
    });
    return {
        ...data,
        deployment_id: deployment_id,
    };
};
