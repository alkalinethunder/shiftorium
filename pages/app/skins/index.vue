<template>
  <div>
    <v-row>
      <v-col cols="12">
        <h1 class="display-1">Browse all skins</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="(skin, i) in skins" :key="i" cols="12" sm="4" md="3">
        <v-card :to="`/app/skin/${skin.slug}`">
          <v-img :lazy-src="skin.thumbnail" />
          <v-card-title>{{ skin.name }}</v-card-title>
          <v-card-text>
            {{ skin.description }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="error">
      <v-col>
        <v-card color="error">
          <v-card-text>
            <strong>Error:</strong>
            {{ errorMessages.join(' ') }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="loading" justify="center">
      <v-progress-circular indeterminate color="primary" size="96" />
    </v-row>
    <v-row v-if="endOfStream" justify="center">
      <v-col>
        <div class="text-center">
          <h3>That's about it.</h3>
          <p>There are no more skins to display.</p>
        </div>
      </v-col>
    </v-row>
    <div v-intersect="loadMore" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      skins: [],
      loading: false,
      error: false,
      errorMesages: [],
      page: 0,
      endOfStream: false,
    }
  },
  methods: {
    async loadBatch(itemsCount) {
      try {
        this.loading = true
        const skinsResponse = await this.$axios.get(
          `/api/skin/page/${this.page}/${itemsCount}`,
        )

        for (const skin of skinsResponse.data.result) {
          const authorResponse = await this.$axios.get(
            `/api/user/${skin.author}`,
          )
          skin.author = authorResponse.data.result

          if (skin.thumbnail) {
            const thumbnail = await this.$axios.get(
              `/api/upload/info/${skin.thumbnail}`,
            )
            skin.thumbnail = `/api/upload/${thumbnail.slug}`
          } else {
            skin.thumbnail = '/branding/shiftos.png'
          }

          this.skins.push(skin)
        }

        this.page++
        this.endOfStream = skinsResponse.data.result.length < itemsCount
      } catch (err) {
        this.error = true
        this.errorMessages = [err.message]
        if (err.response) {
          this.errorMessages.push(...err.response.data.errors)
        }
      }

      this.loading = false
    },
    async loadMore() {
      await this.loadBatch(50)
    },
  },
}
</script>
