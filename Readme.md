# Zweitag GitHub Actions

These are Zweitag's public GitHub actions that we use in our GitHub build pipelines.

## Global Variables

<p align="left">
  <a href="https://github.com/zweitag/github-actions/actions"><img alt="GitHub Actions status" src="https://github.com/zweitag/github-actions/workflows/global-variables/badge.svg"></a>
</p>

This action sets global environment variables from a file which are available for all subsequent steps.

### Inputs

#### `file`

The relative path to the environment file in your repository. Defaults to `.github/workflows/.env.global`.
The file must be in the following shema:

```
ONE_KEY=VALUE1
ANOTHER_KEY=VALUE2
# Comments are possible aswell.
# Empty lines will be ignored.

```

### Example usage

#### with default file:

```
- uses: zweitag/github-actions/global-variables@main
```

#### with custom environment file:

```
- uses: zweitag/github-actions/global-variables@main
  with:
    file: 'config/.env.development'
```

## trivy-scan

This reusable workflow is part of the Security-Scanning workflows. This workflow is for Security-Scanning with [Trivy](https://github.com/aquasecurity/trivy) and provides a cost-effective, reusable security scanning pipeline that works in any repository without relying on paid GitHub Code Scanning features. 

It runs Trivy scans (filesystem, image, or configuration), converts the results into a standardized CTRF report, renders a human-friendly summary via Handlebars templates in the job output, and optionally creates or comments on a GitHub Issue when findings cause the scan to fail.

### Inputs
- scan-type (string, default: "filesystem"): Type of scan to run. One of "image", "filesystem", or "config".
- check-secrets (boolean, default: false): Whether to include secret scanning (relevant for filesystem scans only).
- severity-level (string, default: "HIGH,CRITICAL,UNKNOWN"): Comma-separated severities to report. Supported: "LOW,MEDIUM,HIGH,CRITICAL,UNKNOWN".
- ignorefile (string, default: ""): Optional path to a Trivy ignore file.
- path (string, default: "."): Directory to scan. For image scans, this directory must contain a Dockerfile.
- use-test-reporter (boolean, default: true): Whether to render CTRF + template. If false, results are available in the scan step logs.
- issue-on-findings (string, default: ""): GitHub username to mention. If set and the scan fails, an Issue will be created/commented and the user mentioned.

### Example usage

filesystem scan:
```yaml
jobs:
  scan_filesystem:
    uses: zweitag/github-actions/.github/workflows/trivy-scan.yaml@main
    with:
      scan-type: "filesystem"
      path: "."
      check-secrets: true
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Optional: improves reliability of Trivy DB downloads
```

image scan:
```yaml
jobs:
  scan_docker_image:
    uses: zweitag/github-actions/.github/workflows/trivy-scan.yaml@main
    with:
      scan-type: "image"
      path: "."
      severity-level: 'HIGH,CRITICAL'
      ignorefile: "./.trivyignore.yaml"
      use-test-reporter: true
      issue-on-findings: "JohnDoe"
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Optional: improves reliability of Trivy DB downloads
      DOCKER_IMAGE_SECRETS: ${{ secrets.DOCKER_IMAGE_SECRETS }} # Optional: if your Docker build needs secrets
```

config-scan:
```yaml
jobs:
  scan_configuration:
    uses: zweitag/github-actions/.github/workflows/trivy-scan.yaml@main
    with:
      scan-type: "config"
      path: "."
      severity-level: "LOW,MEDIUM,HIGH,CRITICAL,UNKNOWN"
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Optional: improves reliability of Trivy DB downloads
```

### Test-reporter
- Embeds a human‑readable report in the workflow run (Job Summary), rendered from the CTRF JSON via Handlebars.
- If findings are present, it shows:
  - A compact summary table (Tests/Passed/Failed, plus severities and Secrets)
  - A collapsible findings list with context (file/image, package/version, lines) and references/guidelines
- If no findings match the configured severities, it displays a “no vulnerabilities found” message for quick confirmation.

### Failure policy and severities
- `severity-level` controls which findings cause the scan step to exit with code 1.
- All findings/vulnerabilities of the set severity are marked as failed.
- Consider adjusting `severity-level` to match your risk policy (e.g., `"HIGH,CRITICAL"`).

### Why not SARIF + GitHub Code Scanning?
- Many security tools (including Trivy) can export SARIF, which is a natural fit for GitHub Code Scanning.
- Limitation: Comprehensive Code Scanning features for private repositories require GitHub Advanced Security (paid). Public repos are free, but most teams operate in private repos and cannot use SARIF-based Code Scanning without extra licensing.
- So this provides a solution that works in any repo without paid GitHub features, still offering reports, visuals, and CI integration.

## checkov-scan

This reusable workflow  is part of the Security-Scanning workflows. This workflow is for Security-Scanning with [Checkov](https://github.com/bridgecrewio/checkov) and provides a cost-effective, reusable security scanning pipeline that works in any repository without relying on paid GitHub Code Scanning features. 

It runs Checkov scans , converts the results into a standardized CTRF report, renders a human-friendly summary via Handlebars templates in the job output, and optionally creates or comments on a GitHub Issue when findings cause the scan to fail.

### Checkov
Checkov is a static code analysis tool for infrastructure as code and a software composition analysis tool for images and open source packages.

It scans cloud infrastructure provisioned using Terraform, Terraform plan, Cloudformation, AWS SAM, Kubernetes, Helm charts, Kustomize, Dockerfile, Serverless, Bicep, OpenAPI, ARM Templates, or OpenTofu and detects security and compliance misconfigurations using graph-based scanning.

### Inputs
- baseline (string, default: ""): Optional path to a Checkov baseline file to suppress previously acknowledged findings.
- path (string, default: "."): Directory to scan.
- soft-fail-on (string, default: "LOW"): Configures Checkov’s soft-fail behavior. Supported values:
  - "": no soft-fail (the job fails on any finding)
  - "LOW" | "MEDIUM" | "HIGH" | "CRITICAL": soft-fail threshold (this severity and lower do not fail the job; higher severities fail)
  - "any": soft-fail for all findings (the job never fails)
- use-test-reporter (boolean, default: true): Whether to render CTRF + template. If false, results are available in the scan step logs.
- issue-on-findings (string, default: ""): GitHub username to mention. If set and the scan fails, an Issue will be created/commented and the user mentioned.

### Example usage

simple scan:
```yaml
jobs:
  checkov_scan:
    uses: zweitag/github-actions/.github/workflows/security-scan.yaml@main
    with:
      path: "."
      use-test-reporter: true
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Optional: improves reliability of dependency downloads
```

scan with baseline and issue mention:
```yaml
jobs:
  checkov_scan:
    uses: zweitag/github-actions/.github/workflows/security-scan.yaml@main
    with:
      path: "./infra"
      baseline: "./.checkov.baseline"
      use-test-reporter: true
      issue-on-findings: "JohnDoe"
    secrets:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }} # Optional: improves reliability of dependency downloads
```

### Test-reporter
- Embeds a human‑readable report in the workflow run (Job Summary), rendered from the CTRF JSON via Handlebars (config_scan_template.hbs).
- If findings are present, it shows:
  - A compact summary table (Tests/Passed/Failed)
  - A collapsible findings list with context (file path, optional line range) and guidelines
- If no findings match the configured policy, it displays a “no misconfigurations found” message for quick confirmation.

### Failure policy
- The workflow uses soft-fail-on as failure controller:
  - "": no soft-fail (the job fails on any finding)
  - "LOW" (default) | "MEDIUM" | "HIGH" | "CRITICAL": soft-fail threshold
- Findings of higher severity cause the step to fail (and may trigger issue creation).
- You can use a baseline file to suppress known findings and reduce noise.

### Why not SARIF + GitHub Code Scanning?
While Checkov can integrate with Code Scanning, comprehensive features for private repositories require GitHub Advanced Security (paid).
This workflow provides standardized reports (CTRF), visual summaries, and optional issue creation without relying on paid features, making it suitable for any repository.

# License

Copyright 2019 Zweitag GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
