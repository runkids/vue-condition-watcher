<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 1rem;
}

.filters {
  display: flex;
  justify-content: center;
  align-items: center;
}

.filters .btn {
  cursor: pointer;
  margin-left: 0.5rem;
}

.filters .date-picker {
  margin-left: 0.5rem;
}

.container,
.loading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
}

.container .card {
  width: calc(100% / 4);
  margin: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.link {
  cursor: pointer;
  color: blue;
}
</style>
