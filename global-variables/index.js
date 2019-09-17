const core = require('@actions/core');
const fs = require('fs');

try {
  var file_name = core.getInput('file');
  var file_content = fs.readFileSync(file_name, 'utf8')
  file_rows = file_content.split("\n")

  file_rows.forEach(function (row, index) {
    row = row.trim();
    if (row && !row.startsWith('#')) {
      global_var = row.split("=")
      core.exportVariable(global_var[0], global_var[1]);
    }
  });
} catch (error) {
  core.setFailed(error.message);
}
