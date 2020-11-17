import LocalScheme from '@nuxtjs/auth/lib/schemes/local'

export default class RefreshScheme extends LocalScheme {
  async fetchUser(endpoint) {
    if (this.options.tokenRequired && !this.$auth.getToken(this.name)) {
      return;
    }

    if (!this.options.endpoints.user) {
      this.$auth.setUser({})
      return;
    }

    const user = await this.$auth.requestWith(
      this.name,
      endpoint,
      this.options.endpoints.user
    )

    const customUser = {
      ...user.result
    }

    this.$auth.setUser(customUser)
  }

  async login(endpoint) {
    if (!this.options.endpoints.login) {
      this.$auth.setUser({})
      return
    }

    const response = await this.$auth.requestWith(
      this.name,
      endpoint,
      this.options.endpoints.login
    )

    if (!response.result) {
      this.setUser({})
      return
    }

    const token = response.result.token
    const user = response.result.user

    await this.setUserToken(token)
    await this.$auth.setUser(user)
  }
}
