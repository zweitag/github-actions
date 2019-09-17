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
The scripts and documentation in this project are released under the Apache 2.0 License
