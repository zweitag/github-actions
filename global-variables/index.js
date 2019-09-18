/*
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
 */

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
