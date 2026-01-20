import json
import sys


def extract_vulnerabilities_from_result(result):
    """Extract vulnerabilities from a Trivy result."""
    tests = []
    vulnerabilities = result.get("Vulnerabilities", []) or []

    for vuln in vulnerabilities:
        tests.append({
            "name": f"{vuln.get('PkgName', '')}@{vuln.get('InstalledVersion', '')} - {vuln.get('VulnerabilityID', '')}",
            "status": "failed",
            "duration": 1,
            "file": result.get("Target", ""),
            "lines": None,
            "guideline": vuln.get("PrimaryURL", ""),
            "severity": vuln.get("Severity", ""),
            "description": vuln.get("Description", ""),
            "message": vuln.get("Title", ""),
            "resolution": f"Update to version {vuln.get('FixedVersion', 'N/A')}" if vuln.get("FixedVersion") else "No fix available",
            "references": vuln.get("References", []),
            "type": result.get("Type", ""),
            "id": vuln.get("VulnerabilityID", ""),
            "package": vuln.get("PkgName", ""),
            "installedVersion": vuln.get("InstalledVersion", ""),
            "fixedVersion": vuln.get("FixedVersion", ""),
        })

    return tests


def extract_secrets_from_result(result):
    """Extract secrets from a Trivy result."""
    tests = []
    secrets = result.get("Secrets", []) or []

    for secret in secrets:
        lines = None
        if secret.get("StartLine") and secret.get("EndLine"):
            lines = [secret["StartLine"], secret["EndLine"]]

        tests.append({
            "name": f"{secret.get('RuleID', '')} - {secret.get('Title', '')}",
            "status": "failed",
            "duration": 1,
            "file": result.get("Target", ""),
            "lines": lines,
            "guideline": "",
            "severity": secret.get("Severity", ""),
            "description": f"Category: {secret.get('Category', '')}",
            "message": secret.get("Match", ""),
            "resolution": "Remove or rotate the exposed secret",
            "references": [],
            "type": "secret",
            "id": secret.get("RuleID", ""),
        })

    return tests


def trivy_fs_to_ctrf(trivy_json):
    """Convert Trivy filesystem scan JSON to CTRF format."""
    tests = []
    results = trivy_json.get("Results", []) or []

    severity_counts = {
        "UNKNOWN": 0,
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
        "CRITICAL": 0
    }

    secrets_count = 0

    for result in results:
        tests.extend(extract_vulnerabilities_from_result(result))
        tests.extend(extract_secrets_from_result(result))

        for vuln in result.get("Vulnerabilities", []) or []:
            sev = str(vuln.get("Severity", "")).upper().strip()
            if sev in severity_counts:
                severity_counts[sev] += 1
            else:
                severity_counts["UNKNOWN"] += 1

        secrets_count += len(result.get("Secrets", []) or [])

    failed = len(tests)

    severity_counts_nonzero = {k: v for k, v in severity_counts.items() if v}
    extensions = {}

    if severity_counts_nonzero:
        extensions["severityCounts"] = severity_counts_nonzero

    if secrets_count:
        extensions["secretsCount"] = secrets_count

    result_obj = {
        "results": {
            "tool": {
                "name": "Trivy Filesystem"
            },
            "summary": {
                "failed": failed
            },
            "tests": tests,
            "environment": {
                "appName": trivy_json.get("ArtifactName", ""),
                "buildName": trivy_json.get("Metadata", {}).get("Branch", ""),
                "buildNumber": (trivy_json.get("Metadata", {}).get("Commit", "") or "")[:8]
            }
        }
    }

    if extensions:
        result_obj["results"]["extensions"] = extensions

    return result_obj


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python trivyfs2ctrf.py <input.json> <output.json>")
        sys.exit(1)

    with open(sys.argv[1]) as f:
        trivy_json = json.load(f)

    ctrf_json = trivy_fs_to_ctrf(trivy_json)

    with open(sys.argv[2], "w") as f:
        json.dump(ctrf_json, f, indent=2)
