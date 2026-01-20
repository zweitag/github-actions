import json
import sys


def extract_checks_from_trivy_result(result):
    checks = []
    misconfigs = result.get("Misconfigurations", [])
    for misconf in misconfigs:
        lines = None
        cause = misconf.get("CauseMetadata", {})
        if "StartLine" in cause and "EndLine" in cause:
            lines = [cause["StartLine"], cause["EndLine"]]
        elif "Code" in cause and "Lines" in cause.get("Code", {}) and cause["Code"]["Lines"]:
            code_lines = cause["Code"]["Lines"]
            if isinstance(code_lines, list) and code_lines:
                lines = [code_lines[0].get("Number"), code_lines[-1].get("Number")]

        checks.append({
            "name": misconf.get("Title", misconf.get("ID", "")),
            "status": "failed" if misconf.get("Status") == "FAIL" else "passed",
            "duration": 1,
            "file": result.get("Target", ""),
            "lines": lines,
            "guideline": misconf.get("PrimaryURL", ""),
            "severity": misconf.get("Severity", ""),
            "description": misconf.get("Description", ""),
            "message": misconf.get("Message", ""),
            "resolution": misconf.get("Resolution", ""),
            "references": misconf.get("References", []),
            "type": misconf.get("Type", ""),
            "id": misconf.get("ID", ""),
        })
    return checks


def trivy_to_ctrf(trivy_json):
    tests = []
    successes_sum = 0

    severity_counts = {
        "UNKNOWN": 0,
        "LOW": 0,
        "MEDIUM": 0,
        "HIGH": 0,
        "CRITICAL": 0
    }

    results = trivy_json.get("Results", [])
    for result in results:
        tests.extend(extract_checks_from_trivy_result(result))

        # Successful scans have no misconfigurations
        misconf_summary = result.get("MisconfSummary", {})
        successes_sum += misconf_summary.get("Successes", 0)

        for misconf in result.get("Misconfigurations", []) or []:
            if misconf.get("Status") == "FAIL":
                sev = str(misconf.get("Severity", "")).upper().strip()
                if sev in severity_counts:
                    severity_counts[sev] += 1
                else:
                    severity_counts["UNKNOWN"] += 1

    total = len(tests) + successes_sum
    passed = successes_sum
    failed = sum(1 for t in tests if t["status"] == "failed")
    pending = 0
    skipped = 0
    other = 0
    start = 0
    stop = 1

    return {
        "results": {
            "tool": {
                "name": "Trivy Configuration"
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
            },
            "extensions": {
                "severityCounts": severity_counts
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
