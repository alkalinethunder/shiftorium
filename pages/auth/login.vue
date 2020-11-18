<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div class="text-center">
        <img src="/branding/shiftos.png" />
      </div>
      <v-card>
        <v-card-title class="headline">Log In</v-card-title>
        <v-form @submit="tryLogin">
          <v-card v-if="error.active" color="error" outlined>
            <v-card-text>
              <strong>Error:</strong>
              {{ errors }}
            </v-card-text>
          </v-card>

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
  middleware: 'auth',
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
      error: {
        messages: [],
        active: false,
      },
    }
  },
  computed: {
    errors() {
      return this.error.messages.join(' ')
    },
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
        this.$router.replace('/app/profile')
      } catch (err) {
        this.error.active = true

        if (err.response) {
          this.error.messages = err.response.data.errors
        } else {
          this.error.messages = [err.message]
        }
      }
    },
  },
}
</script>
