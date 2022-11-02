# Fleet Routing App Deployment

[**Terraform**](https://www.terraform.io/) module to deploy
a containerized build of the **Fleet Routing App**
to a *Google Cloud* project.

## Deployment Strategy

Some initial manual [project setup](../docs/project.md) is required, for resources not covered by Google Cloud APIs (OAuth Client ID, API Key, etc.).

After that initial setup, Terraform creates/enables the required Google Cloud resources
and deploys the applicaiton to *Cloud Run*.

### Releasing a New Version

- Build and tag a new container image for the application and push to Google **Artifact Registry**
- Update the `deployment_tag` value in your Terraform configuration
- Run `terraform apply`

For detailed deployment steps, follow the directions in
[`docs/deployment.md`](../docs/deployment.md)
