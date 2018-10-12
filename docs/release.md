# Release

Be sure to build the distribution before releasing.

```
$ npm run build
$ git commit -am "Build dist"
```

Then bump the version.

```
$ npm version minor # or major or patch, depending on the changes.
```

Publish to npm.

```
$ npm login # use the spanishdict account
$ npm whoami # check to be sure
$ npm publish
```
