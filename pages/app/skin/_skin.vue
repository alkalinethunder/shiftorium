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
          <v-card-subtitle class="overline">More Information</v-card-subtitle>
          <v-card-text v-if="skin.markdown">
            <markdown-renderer :value="skin.markdown" />
          </v-card-text>
          <v-card-text v-else>
            This skin has no additional information.
          </v-card-text>
          <v-card-actions v-if="isOwner">
            <v-spacer />
            <v-btn icon @click.stop="startEditMarkdown">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
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
            <v-list-item @click="startEdit">
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
    </v-row>

    <v-dialog v-model="editing" width="700">
      <v-form v-model="edit.valid" @submit="saveEdits">
        <v-card v-if="editing">
          <v-card-title class="headline">Edit Skin Metadata</v-card-title>

          <v-card v-if="editError.active" color="error">
            <v-card-text>
              <strong>Error:</strong>
              {{ editErrors }}
            </v-card-text>
          </v-card>

          <v-card-text>
            <v-text-field
              v-model="edit.name"
              label="Skin name"
              hint="Change to rename your skin."
              outlined
              required
            />
            <v-text-field
              v-model="edit.description"
              label="Description"
              hint="Change the description of your skin."
              outlined
              required
            />
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-spacer />
            <v-btn text @click.stop="editing = false">Cancel</v-btn>
            <v-btn text color="primary" type="submit" :disabled="!edit.valid">
              Save Changes
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>

    <v-dialog v-model="editingMarkdown" width="1000">
      <v-form @submit="saveMarkdown">
        <v-card>
          <v-card-title class="headline">Edit Markdown</v-card-title>
          <v-card color="error" v-if="editError.active">
            <v-card-text>
              <strong>Error:</strong>
              {{ editErrors }}
            </v-card-text>
          </v-card>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-textarea
                  v-model="edit.markdown"
                  label="Markdown"
                  hint="GitHub-flavoured Markdown is supported."
                  outlined
                />
              </v-col>
              <v-col cols="12" sm="6">
                <markdown-renderer :value="edit.markdown" />
              </v-col>
            </v-row>
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-spacer />
            <v-btn text @click.stop="editingMarkdown = false">Cancel</v-btn>
            <v-btn text type="submit" color="primary">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
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
        markdown: 'Loading...',
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
      edit: {
        name: '',
        description: '',
        markdown: '',
        valid: true,
      },
      editing: false,
      editingMarkdown: false,
      editError: {
        active: false,
        messages: [],
      },
    }
  },
  computed: {
    editErrors() {
      return this.editError.messages.join(' ')
    },
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
        this.skin.markdown = this.skin.markdown || ''
      })
      .catch((err) => {
        this.$nuxt.error(err)
      })
  },
  methods: {
    async saveMarkdown(evt) {
      evt.preventDefault()
      try {
        this.editError.active = false
        this.editError.messages = []
        const response = await this.$axios.post(`/api/skin/${this.skin.slug}`, {
          markdown: this.edit.markdown,
        })
        this.editingMarkdown = false
        this.skin.markdown = response.data.result.markdown
      } catch (err) {
        this.editError.active = true
        if (err.response) {
          this.editError.messages = err.response.data.errors
        } else {
          this.editError.messages = [err.message]
        }
      }
    },
    async saveEdits(evt) {
      evt.preventDefault()
      try {
        this.editError.active = false
        this.editError.messages = []
        const response = await this.$axios.post(`/api/skin/${this.skin.slug}`, {
          name: this.edit.name,
          description: this.edit.description,
        })
        this.editingMarkdown = false
        const slug = response.data.result.slug
        if (slug !== this.skin.slug) {
          this.$router.replace(`/app/skin/${slug}`)
        } else {
          this.skin.name = response.data.result.name
          this.skin.description = response.data.result.description
          this.editing = false
        }
      } catch (err) {
        this.editError.active = true
        if (err.response) {
          this.editError.messages = err.response.data.errors
        } else {
          this.editError.messages = [err.message]
        }
      }
    },
    startEditMarkdown() {
      this.editError.active = false
      this.edit.markdown = this.skin.markdown
      this.editingMarkdown = true
    },
    startEdit() {
      this.editError.active = false
      this.edit.name = this.skin.name
      this.edit.description = this.skin.description
      this.editing = true
    },
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
