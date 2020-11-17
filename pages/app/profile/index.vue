<template>
  <div />
</template>

<script>
export default {
  middleware: 'auth',
  mounted() {
    this.$router.replace(`/app/profile/${this.$auth.user.username}`)
  },
}
</script>
