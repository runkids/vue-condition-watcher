### [1.4.7](https://github.com/runkids/vue-condition-watcher/releases/tag/1.4.7) (2022-04-15)
  * Chore: Improve Types

### [1.4.6](https://github.com/runkids/vue-condition-watcher/releases/tag/1.4.6) (2022-04-14)
  * Fix: Type: DeepReadonly to Readonly

### [1.4.5](https://github.com/runkids/vue-condition-watcher/releases/tag/1.4.5) (2022-04-14)
  * [chore(afterFetch & beforeFetch): improve types #14](https://github.com/runkids/vue-condition-watcher/pull/14)
### [1.4.4](https://github.com/runkids/vue-condition-watcher/releases/tag/1.4.4) (2022-04-11)
  * [chore(types): improve types #13](https://github.com/runkids/vue-condition-watcher/pull/13)
### [1.4.3](https://github.com/runkids/vue-condition-watcher/releases/tag/1.4.3) (2022-01-13)
  * Fix: Sync query string to conditions convert type bug fix, need check the initial array value type before update conditions.
  ```js
    // If query string &types=1,2,3
    const conditions = {
      types: []
    }
    // the conditions.types convert value will be ['1', '2', '3']

    const conditions = {
      types: ['1']
    }
    // the conditions.types convert value will be ['1', '2', '3']

    const conditions = {
      types: [1]
    }
    // the conditions.types convert value will be [1, 2, 3]
  ```
### [1.4.2](https://github.com/runkids/vue-condition-watcher/releases/tag/1.4.2) (2022-01-10)
  * Fix: Cache not work on globally.
  ### Changed
  * `loading`: when `!data.value & !error.value` will be `true`.
  * `data`: change default value `null` to `undefined`
  * `error`: change default value `null` to `undefined`

  ### Add Return value
  * `isFetching`: The status of the request being processed.

### [1.4.1](https://github.com/runkids/vue-condition-watcher/releases/tag/1.4.1) (2022-01-09)
  * Fix bug for vue2
  ```
    error  in ./node_modules/vue-condition-watcher/esm/core/utils/helper.js
    Module parse failed: Unexpected token (9:66)
    You may need an appropriate loader to handle this file type, currently no loaders are configured to process this file. See https://webpack.js.org/concepts#loaders
    | export const hasWindow = () => typeof window != STR_UNDEFINED;
    | export const hasDocument = () => typeof document != STR_UNDEFINED;
    > export const isDocumentVisibility = () => hasDocument() && window?.document?.visibilityState === 'visible';
    | export const hasRequestAnimationFrame = () => hasWindow() && typeof window['requestAnimationFrame'] != STR_UNDEFINED;
    | export const isNil = (val) => val === null || val === undefined;

    @ ./node_modules/vue-condition-watcher/esm/core/useConditionWatcher.js 6:0-96 10:15-27 15:15-27 49:35-43 140:12-23 140:39-47 144:12-15
    @ ./node_modules/vue-condition-watcher/esm/index.js
    @ ./node_modules/cache-loader/dist/cjs.js??ref--12-0!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--0-0!./node_modules/vue-loader/lib??vue-loader-options!./src/views/InfiniteScrolling.vue?vue&type=script&lang=js&
    @ ./src/views/InfiniteScrolling.vue?vue&type=script&lang=js&
    @ ./src/views/InfiniteScrolling.vue
    @ ./src/router/index.js
    @ ./src/main.js
    @ multi (webpack)-dev-server/client?http://192.168.68.114:8081&sockPath=/sockjs-node (webpack)/hot/dev-server.js ./src/main.js
  ```

### [1.4.0](https://github.com/runkids/vue-condition-watcher/releases/tag/1.4.0) (2022-01-09)
### Changed
  * Change `data` type: `ref` to `shallowRef`
  * `mutate` now support callback function
    ```js
      const finalData = mutate((currentData) => {
        currentData[0].name = 'runkids'
        return currentData
      })
    ```
  * `resetConditions` can receiver object to update conditions
    ```js
      const config = {
        conditions: {
          a: '1',
          b: '2'
        }
      }
      // to default conditions value
      resetConditions() // { a: '1', b: '2' }

      // update by key value
      resetConditions({
        b: '3'
      }) // { a: '1', b: '3' }
    ```
### Features:

* **Add new configs for Polling feature**:
1. pollingInterval: default is 0
2. pollingWhenHidden: default is false
3. pollingWhenOffline: default is false
* **Add new configs for Revalidate on Focu feature**:
4. revalidateOnFocus: default is false
* **Add new configs for Cache & Preload**
5. cacheProvider: `() => new Map()`

---------------------------------
### [1.3.0](https://github.com/runkids/vue-condition-watcher/releases/tag/1.3.0) (2022-01-07)
### Features:
* **Add Configs**:
1. `manual`: you can manual fetching data now,  just use `execute` to fetch data.
2. `history`: the history mode you can sync conditions with URL, base on vue-router (V3 & V4 support)

* **Add Return Values**:
1. `mutate`: use `mutate` to directly modify data

## BREAKING CHANGES:
* **Modify**:
1. Changed `data` from `shallowRef` to `ref`.

* **Deprecated**:
1. `queryOptions` are now removed, replace `queryOptions` with `config.history`. The `sync` no need inject router now just use `router`
    ```js
      const router = useRouter()

      // Before
      Provider(router)
      useConditionWatcher(
        {
          fetcher,
          conditions,
        }, 
        {
          sync: 'router'
        }
      )

      // After
      useConditionWatcher(
        {
          fetcher,
          conditions,
          history: {
            sync: router
          }
        }, 
      )
    ```
---------------------------------

### [1.2.3](https://github.com/runkids/vue-condition-watcher/releases/tag/1.2.3) (2022-01-06)
### Fix
  * types entry

### [1.2.2](https://github.com/runkids/vue-condition-watcher/releases/tag/1.2.2) (2022-01-06)
### Fix
  * Type generation

### [1.2.1](https://github.com/runkids/vue-condition-watcher/releases/tag/1.2.1) (2022-01-02)
### Modify
  * Modify execute type

### [1.2.0](https://github.com/runkids/vue-condition-watcher/releases/tag/1.2.0) (2022-01-02)
### Add
  * Add fetch events `onFetchSuccess`, `onFetchError`, `onFetchFinally`
### Changed
  * `onConditionsChange` return type changed.
  ```js
    //Before is array
    onConditionsChange(([newCond, oldCond]) => {})
    //After is arguments
    onConditionsChange((newCond, oldCond) => {})
  ```

### [1.1.4](https://github.com/runkids/vue-condition-watcher/releases/tag/1.1.4) (2022-01-02)
### Changed
  * Change return value `data`, `error`, `loading` to readonly
  * Change `data` type: `ref` to `shallowRef`

### [1.1.3](https://github.com/runkids/vue-condition-watcher/releases/tag/1.1.3) (2022-01-02)
### Fix
  * Refactor Queue class to hook function

### [1.1.2](https://github.com/runkids/vue-condition-watcher/releases/tag/1.1.2) (2022-01-02)
### Fix
  * Keep requests first in - first out

### [1.1.1](https://github.com/runkids/vue-condition-watcher/releases/tag/1.1.1) (2022-01-01)
### Fix
  * Build files bug

### [1.1.0](https://github.com/runkids/vue-condition-watcher/releases/tag/1.1.0) (2022-01-01)
### Fix
  * `immediate` not working in sync router mode 
### Add
  * Return Value: `resetConditions`
  * Return Value: `onConditionsChange`
### [1.0.1](https://github.com/runkids/vue-condition-watcher/releases/tag/1.0.1) (2022-01-01)

### Fix
  * Build files bug
### [1.0.0](https://github.com/runkids/vue-condition-watcher/releases/tag/1.0.0) (2022-01-01)

### Changed
 * Deprecate `refresh`
 * You can use async & await function now in `beforeFetch`, `afterFetch`.
 * `afterFetch` should be return an data.

### Add
  * Config: `initialData`
  * Config: `immediate`
  * Config: `onFetchError`
  * Return Value: `execute`

### [0.1.12](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.12) (2021-08-11)

### Chore

* Refactor types

### Other

* Requires Node.js 12.0.0 or higher

### [0.1.11](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.11) (2021-07-19)

### Fix

* Use stable version for vue-demi

### [0.1.10](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.10) (2021-03-29)

### Fix

* No sync query use vue2 vue-router

### [0.1.9](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.9) (2021-03-26)

### Feature

* Add query option property navigation

### [0.1.8](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.8) (2021-02-17)

### Fix

* Utils bug

### [0.1.7](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.7) (2021-02-17)

### Fix

* Utils bug

### [0.1.6](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.6) (2020-08-04)

### Fix

* Can not find modules

### [0.1.5](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.5) (2020-08-04)

### Chore

* Remove peer dependency
* Modify readme

### [0.1.4](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.4) (2020-07-05)

### Feature

* Add function `afterFetch` and return `data`.
* Add demo for vue2 with vue-infinite-scroll

### [0.1.3](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.3) (2020-07-05)

### Chore

* Remove rfdc ([cae3ea7](https://github.com/runkids/vue-condition-watcher/commit/cae3ea792ace46526e8a993ddf90dbaa5c37c8eb))

### [0.1.2](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.2) (2020-07-05)

### Bug Fix

* Check new condition and prev condition is equivalent before fetch data. ([24680f2](https://github.com/runkids/vue-condition-watcher/commit/24680f22b1ee6c1b7c820c5a4722cb77c80fabeb))

### [0.1.1](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.1) (2020-07-05)

### Chore

* Move rfdc to dependencies.
* Update vue-demi version

### [0.1.0](https://github.com/runkids/vue-condition-watcher/releases/tag/0.1.0) (2020-07-04)

### Bug Fix

* Fix history back and forward bug ([f997f31](https://github.com/runkids/vue-condition-watcher/commit/f997f3117e8ff848905f547f5c063e3319c3ae6f))
* If not use router, fetch data when instance created ([0f7daba](https://github.com/runkids/vue-condition-watcher/commit/0f7dababcf1dd3255e216e758230012deb50907d))

### Refactor

* Remove watchEffect, change use watch ([fa0f03e](https://github.com/runkids/vue-condition-watcher/commit/fa0f03e51340e0d10de97bdc400edf115728cbc6))

### Chore

* Add vue2 with vue-composition-api example

### Feature

* support vue2 with vue-composition-api

### [0.0.11](https://github.com/runkids/vue-condition-watcher/releases/tag/0.0.10) (2020-07-03)

### Chore

* Update Vue to beta 18
* Use vue-demi to support vue2.x

### [0.0.10](https://github.com/runkids/vue-condition-watcher/releases/tag/0.0.10) (2020-06-30)

### Chore

* Update Vue to beta 16
* Update Vue Router to Alpha 13

### [0.0.9](https://github.com/runkids/vue-condition-watcher/releases/tag/0.0.9) (2020-06-13)

### Chore

* Update Vue to beta 15

### [0.0.8](https://github.com/runkids/vue-condition-watcher/releases/tag/0.0.8) (2020-05-25)

### Feature

* Sync the state with the query string and initialize off of that so that back/forward work.

### [0.0.7](https://github.com/runkids/vue-condition-watcher/releases/tag/0.0.7) (2020-05-24)

### Feature

* Sync the state with the query string and initialize off of that so that refresh work.
(back/forward) not finish

### [0.0.6](https://github.com/runkids/vue-condition-watcher/releases/tag/0.0.6) (2020-05-23)

### Bug Fix

* loading state should return true when fetching data ([1bf4e93](https://github.com/runkids/vue-condition-watcher/commit/1bf4e93b4ca6450bd4d4db1c389323260ec2b6ea))
* use rdfc deep copy conditions ([1bf4e93](https://github.com/runkids/vue-condition-watcher/commit/1bf4e93b4ca6450bd4d4db1c389323260ec2b6ea))

### [0.0.5](https://github.com/runkids/vue-condition-watcher/releases/tag/0.0.5) (2020-05-23)

### Code Refactoring

* rename beforeFetchData to beforeFetch ([2450c1d](https://github.com/runkids/vue-condition-watcher/commit/2450c1d0a7faacb9e2408e5aebf4b277eefdaa20))
