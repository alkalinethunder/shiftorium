<template>
  <div>
    <v-card-title>Audit Log</v-card-title>
    <v-card-text>
      <p>
        Any action performed by a user that modifies the data of Shiftorium is
        displayed here - including your own actions. Click on an action to view
        additional information.
      </p>
    </v-card-text>

    <v-list dense>
      <v-list-item
        v-for="(entry, i) in log"
        :key="i"
        @click.stop="viewEntry(entry)"
      >
        <v-list-item-avatar :color="entry.instigator.color" />
        <v-list-item-content two-line>
          <v-list-item-title>
            <strong>
              {{ entry.instigatorName }}
            </strong>
            {{ entry.action }}.
          </v-list-item-title>
          <v-list-item-subtitle>{{ entry.when }} ago</v-list-item-subtitle>
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
      <h2>Nothing more to show here!</h2>
      <p>There are no more audit logs to display.</p>
    </div>

    <v-dialog v-model="isViewingLog" width="700">
      <v-card v-if="currentLog">
        <v-card-title class="headline">Audit log entry</v-card-title>

        <v-list dense>
          <v-list-item>
            <v-list-item-avatar :color="currentLog.instigator.color" />

            <v-list-item-content two-line>
              <v-list-item-title>
                <strong>
                  {{ currentLog.instigatorName }}
                </strong>
                {{ currentLog.action }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ currentLog.when }} ago
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-card-text>
          <dl>
            <dt>Additional information</dt>
            <dd>{{ currentLog.message }}</dd>
          </dl>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />

          <v-btn text @click.stop="isViewingLog = false">Close</v-btn>
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
      log: [],
      page: 0,
      endOfStream: false,
      loading: false,
      error: {
        active: false,
        messages: [],
      },
      isViewingLog: false,
      currentLog: null,
    }
  },
  computed: {
    errors() {
      return this.error.messages.join(' ')
    },
  },
  methods: {
    viewEntry(entry) {
      this.currentLog = entry
      this.isViewingLog = true
    },
    byDate(a, b) {
      return new Date(b.date) - new Date(a.date)
    },
    async loadMore() {
      if (this.endOfStream) return false

      this.loading = true

      try {
        const itemCount = 50
        const logResponse = await this.$axios.get(
          `/api/admin/logs/${this.page}/${itemCount}`,
        )

        for (const log of logResponse.data.result) {
          // instigator name
          if (log.instigator) {
            if (log.instigator.firstName) {
              log.instigatorName =
                log.instigator.firstName + ' ' + log.instigator.lastName
            } else {
              log.instigatorName = log.instigator.username
            }
          } else {
            log.instigatorName = 'System'
          }

          // time ago
          log.when = dayjs(log.date).fromNow(true)

          this.log.push(log)
        }

        this.log.sort(this.byDate)

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
