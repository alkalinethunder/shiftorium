<template>
  <v-row>
    <v-col cols="12">
      <v-card :color="user.color">
        <img :src="cover" />
        <div v-if="fullName">
          <v-card-title class="headline">
            {{ fullName }}
          </v-card-title>
          <v-card-subtitle class="headline">
            {{ user.username }}
          </v-card-subtitle>
        </div>
        <div v-else>
          <v-card-title class="headline">
            {{ user.username }}
          </v-card-title>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  computed: {
    fullName() {
      return this.user.firstName + ' ' + this.user.lastName
    },
    cover() {
      return this.user.background || '/img/default-profile-cover.png'
    },
  },
  data() {
    return {
      user: {
        username: 'username',
        avatar: '/branding/logo.png',
        about: 'Loading...',
        background: '/branding/shiftos.png',
        firstName: 'Loading',
        lastName: 'Profile...',
        color: 'primary',
      },
      loading: true,
    }
  },
  mounted() {
    this.$axios
      .get(`/api/auth/user/${this.$route.params.username}`)
      .then((response) => {
        this.user = response.data.result
        this.loading = false
      })
      .catch((err) => {
        this.$nuxt.error(err)
      })
  },
}
</script>
