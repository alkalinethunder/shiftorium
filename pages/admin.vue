<template>
  <v-row>
    <v-col cols="12">
      <h1 class="headline">Administration Control Panel</h1>
    </v-col>
    <v-col v-if="denied" cols="12">
      <v-card>
        <v-card-title>You do not have permission to be here.</v-card-title>

        <v-card-text>
          <p>
            You cannot access the administration control panel with this
            account. You must be granted owner or admin privileges to be here.
          </p>
          <p>
            If you believe this is an error, contact another admin. If this is a
            possible bug in the code, try
            <a href="https://github.com/alkalinethunder/shiftorium/issues">
              opening a GitHub issue.
            </a>
          </p>
        </v-card-text>

        <v-card-actions>
          <v-btn text to="/app">Get back to safety</v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col v-else>
      <v-card flat>
        <v-tabs>
          <v-tab v-for="(tab, i) in tabs" :key="i" router exact :to="tab.to">
            {{ tab.text }}
          </v-tab>
        </v-tabs>

        <NuxtChild />
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      tabs: [
        {
          to: '/admin',
          text: 'Overview',
        },
        {
          to: '/admin/users',
          text: 'Users',
        },
        {
          to: '/admin/skins',
          text: 'Skins',
        },
        {
          to: '/admin/mods',
          text: 'Mods',
        },
        {
          to: '/admin/files',
          text: 'Files',
        },
        {
          to: '/admin/log',
          text: 'Audit Log',
        },
      ],
      denied: false,
    }
  },
  computed: {
    isAdmin() {
      return this.$auth.user.owner || this.$auth.user.admin
    },
  },
  mounted() {
    if (!this.isAdmin) {
      this.denied = true
    }
  },
}
</script>
