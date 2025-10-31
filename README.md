<!-- Top anchor -->
<div id="top">

<!-- Project Shields -->

<div align=center>

[![Contributors shield][Contributors shield url]][Contributors url]
[![Issues shield][Issues shield url]][Issues url]
[![License shield][License shield url]][License url]

</div>

<div align=center>

[![backupRepos logo][Logo url]][Repo url]

</div>

<div align=center>

# backupRepos

</div>

## Table of Contents

<details>

   <summary>Contents</summary>

1. [About](#about)
   1. [Built With](#built-with)
1. [Getting Started](#getting-started)
   1. [Prerequisites](#prerequisites)
   1. [Setting Up](#setting-up)
1. [Usage](#usage)
   1. [Basic Usage](#basic-usage)
      1. [Arguments](#arguments)
      1. [Example](#example)
1. [Roadmap](#roadmap)
1. [Contributing](#contributing)
1. [Changelog](#changelog)
1. [Contact Me](#contact-me)
1. [License](#license)
1. [Acknowledgments](#acknowledgments)

</details>

## About

A script to scan repos for unpushed changes and back them up.

[![backupRepos screenshot][backupRepos screenshot url]][backupRepos url]

<div align=right>

([back to top](#top))

</div>

### Built With

[![Node.js shield][Node.js shield url]][Node.js url]
[![Typescript][Typescript shield url]][Typescript url]

<div align=right>

([back to top](#top))

</div>

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

Make sure you have the following packages installed globally on your machine to use this template.

1. [Node.js 20.6.0+][Node.js url] (Run `nvm use` (if using nvm) to switch to 20.6.0.).
1. [npm][npm url].
1. The TypeScript compiler.

   ```sh
   sudo npm install --global typescript
   ```

### Setting Up

1. Download the [latest release][latest release url] of the template.

1. Extract the downloaded file.

1. Rename the extracted folder to your project name.

1. Navigate to the project directory.

   ```sh
   cd <your-project-name>
   ```

1. Install dependencies.

   ```sh
   npm install
   ```

1. Run the setup script to customize the template:

   ```sh
   npm run setup
   ```

<div align=right>

([back to top](#top))

</div>

## Usage

### Basic Usage

Scan git repositories under one or more specified paths for unpushed changes (or all files if no upstream remote) and back them up to a structured location:

```sh
backup-repos backup <path1> [<path2> ...] <backup-location>
```

#### Arguments

- `<my-notes-path>`: Path to a directory containing git repos (e.g., `~/my-notes`).
- `<repos-path>`: Path to another directory containing git repos (e.g., `~/repos`).
- `<backup-location>`: Base path for backups (e.g., `~/backups`). Backups are stored under `<backup-location>/Backups/<platform>/<home-relative-repo-path>/`.

#### Example

```sh
backup-repos backup ~/my-notes ~/repos ~/backups
```

This will process repos under `~/my-notes` and `~/repos`, copy modified/untracked files to `~/backups/Backups/<platform>/~/my-notes/<repo-name>/` (etc.), and also back up non-ignored `temp/` directories under `<repos-path>`. Files unchanged since last backup are skipped.

Run with `--help` for more details.

_For more examples, please refer to the [Documentation][Documentation url]_

<div align=right>

([back to top](#top))

</div>

## Roadmap

See the [open issues][Issues url] for a full list of proposed features (and known issues).

<div align=right>

([back to top](#top))

</div>

## Contributing

To add a feature or fix a bug, fork the repo and create a pull request.

Example instructions to add a feature:

1. Fork the Project
1. Create your Feature Branch (`git checkout -b feature/amazing-feature-YourName`)
1. Commit your Changes (`git commit -m 'Add some amazing feature'`)
1. Push to the Branch (`git push origin feature/amazing-feature-YourName`)
1. Open a Pull Request

To suggest a new feature or report a bug, open an issue.

<div align=right>

([back to top](#top))

</div>

## Changelog

See the changelog [here][changelog url].

<div align=right>

([back to top](#top))

</div>

## Contact Me

Sherpad Ndabambi

[![Website icon][Website icon url]][Personal website url]
[![Gmail icon][Gmail icon url]][Email address]

<div align=right>

([back to top](#top))

</div>

## License

Distributed under the ISC License. See [LICENSE][License url] for more information.

<div align=right>

([back to top](#top))

## Acknowledgments

1. [Git Orange logomark][Git Orange logomark url] from the [Git community][Git community url] by [Jason Long][Jason Long X public profile URL] licensed under the [Creative Commons] [Attribution 3.0 Unported][Attribution 3.0 Unported url] license
1. [Website icon][Website icon url] edited from [Website SVG vector][Website SVG vector url] from [SVG Repo][SVG Repo url].

1. [Gmail icon][Gmail icon url] edited from [Gmail SVG vector][Gmail SVG vector url] from [SVG Repo][SVG Repo url].

1. Images in this project have been compressed using [TinyPNG][TinyPNG url].

1. Parts of this README are based on the [Best-README-Template][Best-README-Template url] template.

<div align=right>

([back to top](#top))

</div>

<!-- References -->

[Contributors shield url]: https://img.shields.io/github/contributors/sherpadNdabambi/backup-repos.svg?style=flat
[Contributors url]: https://github.com/sherpadNdabambi/backup-repos/graphs/contributors
[Issues shield url]: https://img.shields.io/github/issues/sherpadNdabambi/backup-repos.svg?style=flat
[Issues url]: https://github.com/sherpadNdabambi/backup-repos/issues
[License shield url]: https://img.shields.io/github/license/SherpadNdabambi/backup-repos
[License url]: ./LICENSE
[Logo url]: ./assets/img/logo.svg
[Repo url]: https://github.com/SherpadNdabambi/backup-repos/
[Node.js shield url]: https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=Node.js&logoColor=white
[Node.js url]: https://nodejs.org/
[backupRepos screenshot url]: ./assets/img/og-image.png
[backupRepos url]: https://github.com/sherpadNdabambi/backup-repos/
[Typescript shield url]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[Typescript url]: https://www.typescriptlang.org/
[npm url]: https://www.npmjs.com/
[latest release url]: https://github.com/sherpadNdabambi/backup-repos/releases/latest
[Documentation url]: https://sherpadndabambi.github.io/backup-repos/
[changelog url]: ./CHANGELOG.md
[Personal website url]: https://sherpadndabambi.github.io/
[Email address]: mailto:sgndabambi@gmail.com
[SVG Repo url]: https://www.svgrepo.com/
[Git Orange logomark url]: https://git-scm.com/community/logos
[Git community url]: https://git-scm.com/community
[Jason Long X public profile URL]: https://x.com/jasonlong
[Creative Commons]: https://creativecommons.org
[Attribution 3.0 Unported url]: https://creativecommons.org/licenses/by/3.0/deed.en
[Website icon url]: ./assets/img/website-ui-web-svgrepo-com.svg
[Website SVG vector url]: https://www.svgrepo.com/svg/415803/website-ui-web
[Gmail icon url]: ./assets/img/gmail-old-svgrepo-com.svg
[Gmail SVG vector url]: https://www.svgrepo.com/svg/349379/gmail-old
[TinyPNG url]: https://tinypng.com/
[Best-README-Template url]: https://github.com/othneildrew/Best-README-Template
