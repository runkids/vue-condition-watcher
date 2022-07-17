
# 2.0.0-beta.0 (2022-07-17)
This is the first 2.0 beta version. Still change until the stable release. Documentation will also be updated once stable.

# Breakings
## `loading` is renamed to `isLoading` 
``` diff
- const { loading } = useConditionWatcher({...})
+ const { isLoading } = useConditionWatcher({...})
```

## Change `export` to `export default`
``` diff
- import { useConditionWatcher } from 'vue-condition-watcher'
+ import useConditionWatcher from 'vue-condition-watcher'
```

# What's Changed

- chore: Switch to pnpm & turborepo & vitest
- breaking: rename loading to isLoading
- fix: `beforeFetch` receive conditions type

### Full Changelog: https://github.com/runkids/vue-condition-watcher/compare/1.4.7...2.0.0-beta.0
