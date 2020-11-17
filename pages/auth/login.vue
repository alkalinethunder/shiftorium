<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div class="text-center">
        <img src="/branding/shiftos.png" />
      </div>
      <v-card>
        <v-card-title class="headline">Log In</v-card-title>
        <v-form @submit="tryLogin">
          <v-card-text>
            <v-text-field
              v-model="form.email"
              label="Email"
              outlined
              :loading="form.loading"
            />
            <v-text-field
              v-model="form.password"
              label="Password"
              type="password"
              outlined
              :loading="form.loading"
            />
          </v-card-text>
          <v-card-actions>
            <v-btn to="/auth/signup" color="primary" text>
              Create Account
            </v-btn>
            <v-spacer />
            <v-btn
              type="submit"
              color="primary"
              :disabled="form.loading || !form.valid"
            >
              Log In
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: 'landing',
  auth: 'guest',
  data() {
    return {
      form: {
        valid: true,
        email: '',
        password: '',
        loading: false,
      },
    }
  },
  methods: {
    async tryLogin(evt) {
      evt.preventDefault()
      const payload = {
        email: this.form.email,
        password: this.form.password,
      }

      try {
        await this.$auth.loginWith('login', { data: payload })
        this.$router.go('/app/profile')
      } catch (err) {
        alert(err)
      }
    },
  },
}
</script>
