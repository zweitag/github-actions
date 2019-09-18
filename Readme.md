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
- uses: zweitag/github-actions/global-variables@master
```

#### with custom environment file:
```
- uses: zweitag/github-actions/global-variables@master
  with:
    file: 'config/.env.development'
```

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
