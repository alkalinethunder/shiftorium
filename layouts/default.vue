<template>
  <v-app dark>
    <v-navigation-drawer fixed app>
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar fixed app v-if="$auth.loggedIn">
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn text to="/upload">Upload</v-btn>
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </v-app-bar>
    <v-app-bar fixed app v-else>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn text to="/auth/login">Log In</v-btn>
      <v-btn text to="/auth/signup">Sign Up</v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer
      v-if="$auth.loggedIn"
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item to="/profile">
          <v-list-item-avatar color="primary">
            <v-icon>mdi-account</v-icon>
          </v-list-item-avatar>
          <v-list-item-content two-line>
            <v-list-item-title>{{ $auth.user.username }}</v-list-item-title>
            <v-list-item-subtitle>My profile</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider />
      </v-list>
      <template slot="append">
        <v-list-item @click.stop="logout">
          <v-list-item-action>
            <v-icon>mdi-logout</v-icon>
          </v-list-item-action>
          <v-list-item-title>Log out</v-list-item-title>
        </v-list-item>
      </template>
    </v-navigation-drawer>
    <v-footer fixed app>
      <span>
        &copy; {{ new Date().getFullYear() }} &bull; Developed by
        <a href="https://mvanoverbeek.me/">Michael VanOverbeek</a>
      </span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          icon: 'mdi-home',
          title: 'Home',
          to: '/app',
        },
        {
          icon: 'mdi-brush',
          title: 'Browse Skins',
          to: '/app/skins',
        },
        {
          icon: 'mdi-tools',
          title: 'Browse Mods',
          to: '/app/mods',
        },
      ],
      right: true,
      rightDrawer: false,
      title: 'The Shiftorium',
    }
  },
  methods: {
    logout() {
      this.$auth.logout()
    },
  },
}
</script>
