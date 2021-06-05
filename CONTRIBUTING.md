# Contributing to Kaikokeke

First off, thanks for taking the time to contribute!

The following is a set of guidelines for contributing to Kaikokeke and its packages. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of conduct

Help us keep Kaikokeke open and inclusive. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md) before interacting with the repository or the community in any way..

## License

By contributing to Kaikokeke, you agree that your contributions will be licensed under its [MIT license](LICENSE.md).

## Developer Certificate of Origin

The Developer Certificate of Origin (DCO) is a lightweight way for contributors to certify that they wrote or otherwise have the right to submit the code they are contributing to the project.

```
By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

Contributors to the Kaikokeke project _sign-off_ that they adhere to these requirements by adding a `Signed-off-by` line to commit messages.

```bash
docs(kaikokeke): update README

Signed-off-by: Random Developer <random@developer.example.org>
```

Git even has a `-s` command line option to append this automatically to your commit message:

```bash
$ git commit -s -m 'docs(kaikokeke): update README'
```

If you have already made a commit and forgot to include the sign-off, you can amend your last commit to add the sign-off with the following command, which can then be force pushed.

```bash
git commit --amend -s
```

We use [commitlint](https://commitlint.js.org/) to ensures that all commits are signed by the contributor.
The [commitizen](https://github.com/commitizen/cz-cli) `commit` script signs the commit by default:

```bash
$ yarn commit
```

## Attribution

The _Developer's Certificate of Origin 1.1_ is available at https://developercertificate.org/.
