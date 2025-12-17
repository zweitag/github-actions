import json
import sys


def extract_checks(target, status):
    # extracts checks of a check_type (e.g. terraform) with a status ('fail' oder 'pass').
    checks = []
    key = "failed_checks" if status == "fail" else "passed_checks"
    for check in target.get("results", {}).get(key, []):
        checks.append({
            "name": check.get("check_name"),
            "status": "passed" if status == "pass" else "failed",
            "duration": 1,
            "file": check.get("file_path"),
            "lines": check.get("file_line_range"),
            "guideline": check.get("guideline") if check.get("guideline") != 'null' else "",
        })
    return checks


def checkov_to_ctrf(checkov_json):
    tests = []
    for target in checkov_json:
        tests.extend(extract_checks(target, "fail"))
        tests.extend(extract_checks(target, "pass"))

    total = len(tests)
    passed = sum(1 for t in tests if t["status"] == "passed")
    failed = sum(1 for t in tests if t["status"] == "failed")
    pending = 0
    skipped = 0
    other = 0
    start = 0
    stop = 1
    return {
        "results": {
            "tool": {
                "name": "Checkov "
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
                "appName": "kamium-deployment",
                "buildName": "kamium-deployment",
                "buildNumber": "1"
            }
        }
    }


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python checkov2ctrf.py <input.json> <output.json>")
        sys.exit(1)
    with open(sys.argv[1]) as old_f:
        checkov_json = json.load(old_f)
    ctrf_json = checkov_to_ctrf(checkov_json)
    with open(sys.argv[2], "w") as new_f:
        json.dump(ctrf_json, new_f, indent=2)
