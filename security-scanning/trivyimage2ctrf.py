import json
import sys


def extract_checks_from_trivy_result(target):
    checks = []
    
    vulnerabilities = target.get("Vulnerabilities", [])
    
    for vuln in vulnerabilities:
        checks.append({
            "name": vuln.get("PkgID", ""),
            "status": vuln.get("Status", "unknown"),
            "duration": 1,
            "severity": vuln.get("Severity", ""),
            "id": vuln.get("VulnerabilityID", ""),
            "pkgName": vuln.get("PkgName", ""),
            "installedVersion": vuln.get("InstalledVersion", ""),
            "fixedVersion": vuln.get("FixedVersion", "no fix available"),
            "image": target.get("Target", ""),
            "source": vuln.get("DataSource", []),
            "description": vuln.get("Description", ""),
            "references": vuln.get("References", [])
        })
    return checks


def trivy_to_ctrf(trivy_json):
    tests = []
    successes_sum = 0
    results = trivy_json.get("Results", [])
    for result in results:
        tests.extend(extract_checks_from_trivy_result(result))

        # Successful scans have no misconfigurations
        misconf_summary = result.get("MisconfSummary", {})
        successes_sum += misconf_summary.get("Successes", 0)

    total = len(tests)
    passed = 0 
    failed = len(tests)
    pending = 0
    skipped = 0
    other = 0
    start = 0
    stop = 1
    return {
        "results": {
            "tool": {
                "name": "Trivy Image"
            },
            "summary": {
                "tests": total,
                "passed": passed,
                "failed": failed,
                "pending": pending,
                "skipped": skipped,
                "other": other,
                "start": start,
                "stop": stop
            },
            "tests": tests,
            "environment": {
                "appName": "kamium-elastic",
                "buildName": "kamium-elastic",
                "buildNumber": "1"
            }
        }
    }


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python trivy2ctrf.py <input.json> <output.json>")
        sys.exit(1)
    with open(sys.argv[1]) as old_f:
        trivy_json = json.load(old_f)
    ctrf_json = trivy_to_ctrf(trivy_json)
    with open(sys.argv[2], "w") as new_f:
        json.dump(ctrf_json, new_f, indent=2)
