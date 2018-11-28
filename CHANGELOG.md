# Change Log

All notable changes to the "comment-bars" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

-----------------------------------------------------------------------------------------

## Release History

### [0.0.1] - [0.0.8]

- Initial release
- **Bug**: Does not work when installed through the marketplace.
- ***Security***: Suffers from a widespread vulnerability to the
  the NPM package `event-streams`. *DO NOT* run or install this
  version of the extension. Read more [here][event-stream-vscode-blog].

### [0.0.9]

- First marketplace release
- ***Security***: (#1 on GitHub) Suffers from a widespread vulnerability to the
  the NPM package `event-streams`. *DO NOT* run or install this
  version of the extension. Read more [here][event-stream-vscode-blog].

### [0.0.10]

- **Fixed**, ***Security***: Fixed the Issue #1 on GitHub. This issue
  was added by Microsoft to all extensions that were contained the
  compromised `event-streams` package. Unfortunately this extension,
  contained a compromised version `event-streams`, as a sub-dependency.
  This has now been fixed by following steps given for extension authors
  on the VSCode Blog post. Approval is still needed from Microsoft for this extension to
  be hosted on the VSCode marketplace. Read more [here][event-stream-vscode-blog].


[event-stream-vscode-blog]: https://code.visualstudio.com/blogs/2018/11/26/event-stream