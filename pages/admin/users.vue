<template>
  <div>
    <v-card-title>Users</v-card-title>
    <v-card-text>
      <p>
        This is a list of all users on the Shiftorium. Click a user to view more
        information and manage the account.
      </p>
    </v-card-text>

    <v-list dense>
      <v-list-item
        v-for="(entry, i) in users"
        :key="i"
        @click.stop="viewEntry(entry)"
      >
        <v-list-item-avatar :color="entry.color" />
        <v-list-item-content two-line>
          <v-list-item-title>
            {{ entry.displayName }}
          </v-list-item-title>
          <v-list-item-subtitle>
            Joined {{ entry.when }} ago
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <v-card v-if="error.active" color="error">
      <v-card-text>
        <strong>Error:</strong>
        {{ errors }}
      </v-card-text>
    </v-card>

    <div class="text-center" v-if="loading">
      <v-progress-circular
        indeterminate
        size="64"
        class="mb-3"
        color="primary"
      />
      <p>Loading...</p>
    </div>

    <div v-if="endOfStream" class="text-center">
      <h2>Things are quiet...</h2>
      <p>There are no more users to display.</p>
    </div>

    <v-dialog v-model="isViewingUser">
      <v-card v-if="currentUser" dense>
        <v-card-title class="headline">Manage user</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col cols="6">
              <h6 class="overline">User Information</h6>
              <v-divider />
              <v-row dense>
                <v-col cols="4">
                  <strong>Email:</strong>
                </v-col>
                <v-col cols="8">{{ currentUser.email }}</v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <strong>Registered:</strong>
                </v-col>
                <v-col cols="8">{{ currentUser.createDate }}</v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <strong>User type:</strong>
                </v-col>
                <v-col cols="8">{{ userType }}</v-col>
              </v-row>
            </v-col>
            <v-col cols="6">
              <h6 class="overline">Permissions</h6>
              <v-divider />
              <v-row dense>
                <v-col cols="4">
                  <strong>Content Visible:</strong>
                </v-col>
                <v-col cols="5">
                  {{ !currentUser.shadowBanned }}
                </v-col>
                <v-col cols="3">
                  <v-btn
                    text
                    small
                    @click.stop="shadowban"
                    :disabled="!canShadowban"
                  >
                    {{ shadowbanText }}
                  </v-btn>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <strong>Login and API Access:</strong>
                </v-col>
                <v-col cols="5">
                  {{ !currentUser.suspended }}
                </v-col>
                <v-col cols="3">
                  <v-btn
                    text
                    small
                    @click.stop="suspend"
                    :disabled="!canSuspend"
                  >
                    {{ suspendText }}
                  </v-btn>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <strong>Site Owner:</strong>
                </v-col>
                <v-col cols="5">
                  {{ currentUser.owner }}
                </v-col>
                <v-col cols="3" v-if="!currentUser.owner">
                  <v-btn
                    text
                    small
                    @click.stop="transferOwnership"
                    :disabled="!canTransferOwnership"
                  >
                    Transfer Ownership
                  </v-btn>
                </v-col>
              </v-row>
              <v-row dense>
                <v-col cols="4">
                  <strong>Administrator:</strong>
                </v-col>
                <v-col cols="5">
                  {{ currentUser.admin }}
                </v-col>
                <v-col cols="3">
                  <v-btn
                    text
                    small
                    @click.stop="grantAdmin"
                    :disabled="!canGrantAdmin"
                  >
                    {{ grantAdminText }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn text @click.stop="isViewingUser = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div v-intersect="loadMore" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import relativeTime from '~/node_modules/dayjs/plugin/relativeTime.js'

export default {
  data() {
    return {
      users: [],
      page: 0,
      endOfStream: false,
      loading: false,
      error: {
        active: false,
        messages: [],
      },
      isViewingUser: false,
      currentUser: null,
    }
  },
  computed: {
    canTransferOwnership() {
      if (!this.$auth.user.owner) return false
      if (this.currentUser.owner) return false
      if (this.currentUser.suspended) return false
      if (this.currentUser.shadowBanned) return false
      return true
    },
    canGrantAdmin() {
      if (this.currentUser.owner) return false
      if (this.currentUser.admin && !this.$auth.user.owner) return false
      if (this.currentUser.suspended) return false
      if (this.currentUser.shadowBanned) return false
      return true
    },
    canShadowban() {
      if (this.currentUser.owner) return false
      if (this.currentUser.admin && !this.$auth.user.owner) return false
      if (this.currentUser.email === 'System') return false
      return true
    },
    canSuspend() {
      if (this.currentUser.owner) return false
      if (this.currentUser.admin && !this.$auth.user.owner) return false
      if (this.currentUser.email === 'System') return false
      return true
    },
    grantAdminText() {
      return this.currentUser.admin ? 'Revoke Admin' : 'Grant Admin'
    },
    shadowbanText() {
      return this.currentUser.shadowBanned ? 'Revoke Shadow-ban' : 'Shadow-ban'
    },
    suspendText() {
      return this.currentUser.suspended ? 'Revoke suspension' : 'Suspend User'
    },
    errors() {
      return this.error.messages.join(' ')
    },
    userType() {
      if (this.currentUser.system) return 'System'
      if (this.currentUser.owner) return 'Owner'
      if (this.currentUser.admin) return 'Administrator'
      return 'Registered User'
    },
  },
  methods: {
    viewEntry(entry) {
      this.currentUser = entry
      this.isViewingUser = true
    },
    byName(a, b) {
      if (b.displayName > a.displayName) return -1
      if (a.displayName > b.displayName) return 1
      return 0
    },
    async loadMore() {
      this.loading = true

      try {
        const itemCount = 50
        const logResponse = await this.$axios.get(
          `/api/admin/users/${this.page}/${itemCount}`,
        )

        for (const log of logResponse.data.result) {
          // display name
          if (log.firstName) {
            log.displayName = log.firstName + ' ' + log.lastName
          } else {
            log.displayName = log.username
          }

          // time ago
          log.when = dayjs(log.createDate).fromNow(true)

          this.users.push(log)
        }

        this.users.sort(this.byName)

        this.page++
        this.endOfStream = logResponse.data.result.length < itemCount
      } catch (err) {
        this.error.active = true
        this.error.messages = [err.message]

        if (err.response) {
          this.error.messages.push(...err.response.data.errors)
        }
      }

      this.loading = false
    },
  },
  mounted() {
    dayjs.extend(relativeTime)
  },
}
</script>
