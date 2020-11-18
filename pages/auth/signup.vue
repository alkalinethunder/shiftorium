<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div class="text-center">
        <img src="/branding/shiftos.png" />
      </div>
      <v-card>
        <v-card-title class="headline">Log In</v-card-title>
        <v-form v-model="valid" @submit="trySignup">
          <v-card v-if="error.active" color="error" outlined>
            <v-card-text>
              <strong>Error:</strong>
              {{ errors }}
            </v-card-text>
          </v-card>

          <v-card-text>
            <v-text-field
              v-model="form.username"
              label="Username"
              hint="Pick a username"
              max-length="30"
              outlined
              :loading="form.loading"
              :rules="nameRules"
              required
            />
            <v-text-field
              v-model="form.email"
              label="Email"
              hint="Your email address will be used to log in and for password resets."
              outlined
              :loading="form.loading"
              :rules="emailRules"
              required
            />
            <v-text-field
              v-model="form.password"
              label="Password"
              type="password"
              outlined
              :loading="form.loading"
              :rules="passwordRules"
              :hint="passwordStrengthHint"
              required
            />
            <v-text-field
              v-model="form.passwordConfirm"
              label="Confirm password"
              hint="Enter the exact same password you did above."
              type="password"
              outlined
              :loading="form.loading"
              :rules="confirmRules"
              required
            />
          </v-card-text>
          <v-card-actions>
            <v-btn to="/auth/login" color="primary" text>Log In</v-btn>
            <v-spacer />
            <v-btn
              type="submit"
              color="primary"
              :disabled="form.loading || !valid"
            >
              Create Account
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import passwordStrength from 'check-password-strength'

export default {
  middleware: 'auth',
  auth: 'guest',
  data() {
    return {
      valid: false,
      form: {
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
      },
      nameRules: [
        (v) => !!v || 'Username is required.',
        (v) => v.length >= 5 || 'Username must be at least 5 characters long.',
        (v) =>
          v.length <= 30 || 'Username cannot exceed 30 characters in length.',
      ],
      emailRules: [
        (v) => !!v || 'Email address is required.',
        (v) => /.+@.+/.test(v) || 'Email must be valid.',
      ],
      passwordRules: [(v) => !!v || 'Password is required.'],
      confirmRules: [
        (v) => !!v || 'Password confirmation is required.',
        (v) => v === this.form.password || 'Passwords do not match.',
      ],
      error: {
        active: false,
        messages: [],
      },
    }
  },
  computed: {
    passwordStrengthHint() {
      try {
        return (
          'Password strength: ' + passwordStrength(this.form.password).value
        )
      } catch (err) {
        return err.message
      }
    },
    errors() {
      return this.error.messages.join(' ')
    },
  },
  methods: {
    async trySignup(evt) {
      evt.preventDefault()
      try {
        await this.$axios.post('/api/auth/signup', this.form)
        await this.$auth.loginWith('login', { data: this.form })
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
