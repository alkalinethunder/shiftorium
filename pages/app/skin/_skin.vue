<template>
  <div>
    <v-row dense>
      <v-col cols="12">
        <v-card>
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-title class="headline">
                {{ skin.name }}
              </v-card-title>

              <v-card-actions>
                <v-btn icon>
                  <v-icon>{{ like }}</v-icon>
                </v-btn>
                <v-btn icon>
                  <v-icon>{{ dislike }}</v-icon>
                </v-btn>
                <v-btn icon>
                  <v-icon>{{ favorite }}</v-icon>
                </v-btn>
                <v-spacer />
              </v-card-actions>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="8" md="9">
        <v-card>
          <v-card-subtitle class="overline">About this skin</v-card-subtitle>

          <v-card-text>
            {{ skin.description }}
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-subtitle class="overline">Screenshots</v-card-subtitle>

          <v-card-text>
            <v-img :src="thumbnail" />
            <v-img
              v-for="(screenshot, i) in skin.screenshots"
              :key="i"
              :src="`/api/upload/${screenshot.slug}`"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4" md="3">
        <v-card>
          <v-card-subtitle class="overline">File Information</v-card-subtitle>

          <v-card-text>
            <v-row>
              <v-col cols="4">
                <strong>File name:</strong>
              </v-col>
              <v-col cols="8">
                {{ skin.download.filename }}
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <strong>File size:</strong>
              </v-col>
              <v-col cols="8">
                {{ filesize }}
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-btn color="primary" class="w-100">
              <v-icon>mdi-download</v-icon>
              Download
            </v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-if="isOwner">
          <v-card-subtitle class="overline">
            Skin Editor Actions
          </v-card-subtitle>

          <input
            type="file"
            class="d-none"
            accept="image/*"
            ref="screenshotUpload"
            @change="beginUpload"
          />

          <v-list>
            <v-list-item @click="triggerUpload">
              <v-list-item-action>
                <v-icon>mdi-pencil</v-icon>
              </v-list-item-action>
              <v-list-item-title>Edit skin info</v-list-item-title>
            </v-list-item>
            <v-list-item @click="triggerUpload">
              <v-list-item-action>
                <v-icon>mdi-cloud-upload</v-icon>
              </v-list-item-action>
              <v-list-item-title>Re-upload</v-list-item-title>
            </v-list-item>
            <v-list-item @click="triggerUpload">
              <v-list-item-action>
                <v-icon>mdi-image</v-icon>
              </v-list-item-action>
              <v-list-item-title>Add screenshot</v-list-item-title>
            </v-list-item>
            <v-list-item @click="triggerUpload">
              <v-list-item-action>
                <v-icon>mdi-trash-can</v-icon>
              </v-list-item-action>
              <v-list-item-title>Delete</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import prettyBytes from 'pretty-bytes'

export default {
  data() {
    return {
      skin: {
        name: 'Loading...',
        description: 'Loading...',
        download: {
          filename: 'Loading...',
          slug: '',
          size: 0,
        },
        author: {
          username: 'Loading...',
          firstName: 'Loading...',
          lastName: 'Loading...',
          avatar: '',
        },
      },
    }
  },
  computed: {
    like() {
      return 'mdi-thumb-up-outline'
    },
    dislike() {
      return 'mdi-thumb-down-outline'
    },
    favorite() {
      return 'mdi-heart-outline'
    },
    thumbnail() {
      if (this.skin.thumbnail) {
        return `/api/upload/${this.skin.thumbnail.slug}`
      } else {
        return '/branding/shiftos.png'
      }
    },
    displayName() {
      if (this.skin.author.firstName && this.skin.author.lastName) {
        return this.skin.author.firstName + ' ' + this.skin.author.lastName
      } else {
        return this.skin.author.username
      }
    },
    secondaryName() {
      if (this.displayName === this.skin.author.username) {
        return ''
      } else {
        return this.skin.author.username
      }
    },
    filesize() {
      return prettyBytes(this.skin.download.size)
    },
    isOwner() {
      return this.$auth.loggedIn && this.$auth.user._id === this.skin.author._id
    },
  },
  mounted() {
    this.$axios
      .get(`/api/skin/${this.$route.params.skin}`)
      .then((response) => {
        this.skin = response.data.result
      })
      .catch((err) => {
        this.$nuxt.error(err)
      })
  },
  methods: {
    triggerUpload() {
      this.$refs.screenshotUpload.click()
    },
    async beginUpload(evt) {
      const screenshot = evt.target.files[0]
      const formData = new FormData()
      formData.append('type', 'image')
      formData.append('file', screenshot)

      const uploadResponse = await this.$axios.post('/api/upload', formData)

      await this.$axios.post(
        `/api/skin/${this.skin.slug}/screenshots`,
        uploadResponse.data.result,
      )

      this.skin.screenshots.push(uploadResponse.data.result)
    },
  },
}
</script>

<style scoped>
.w-100 {
  width: 100%;
}
</style>
