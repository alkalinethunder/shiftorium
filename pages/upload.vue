<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <v-card>
        <v-card-title class="headline">Upload</v-card-title>

        <div v-if="step == 0">
          <v-row justify="center">
            <v-col>
              <div class="text-center">
                <h1>What are you uploading?</h1>
              </div>
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="3">
              <v-card color="primary" @click.stop="startSkin">
                <v-card-text>
                  <div class="text-center">
                    <h1 class="display-4">
                      <v-icon size="96">mdi-brush</v-icon>
                    </h1>
                    <h3>ShiftOS Skin</h3>
                    <p>
                      A custom theme for the ShiftOS desktop. Other Shifters
                      will be able to download this skin directly within The
                      Shiftnet.
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="3">
              <v-card color="primary" @click.stop="startMod">
                <v-card-text>
                  <div class="text-center">
                    <h1 class="display-4">
                      <v-icon size="96">mdi-wrench</v-icon>
                    </h1>
                    <h3>Game Mod</h3>
                    <p>
                      A custom mod for The Shiftnet containing new ShiftOS
                      programs, upgrades, stories, and more.
                    </p>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <div v-if="step == 1">
          <v-card-text class="text-center">
            <h1>
              <v-icon size="128">mdi-cloud-upload</v-icon>
            </h1>
            <h2 class="mb-2">Upload your {{ typeName }}</h2>

            <p>
              <v-btn color="primary" @click.stop="selectFile">
                Select File
              </v-btn>
            </p>
            <p>Or drag and drop a file here</p>
            <p>
              <small>Accepted files: *.zip | Max file size: 10MB</small>
            </p>

            <input
              type="file"
              ref="fileSelect"
              class="d-none"
              accept="application/zip"
              @change="startUpload"
            />
          </v-card-text>
        </div>

        <div v-if="step == 2">
          <v-form v-if="form.type == 'skin'" @submit="pushSkin">
            <v-card-text>
              <v-text-field
                v-model="publicForm.name"
                type="text"
                label="Skin name"
                outlined
              />
              <v-textarea
                v-model="publicForm.description"
                label="Description"
                outlined
              />
              <v-text-field
                v-model="publicForm.upload.filename"
                label="File"
                outlined
                readonly
              />
            </v-card-text>
            <v-card-actions>
              <small>
                Your {{ typeName }} is downloadable through the API at:
              </small>
              <code>
                {{ apiDownloadPath }}
              </code>
              <v-btn type="submit" text color="primary">Publish</v-btn>
            </v-card-actions>
          </v-form>
          <v-form v-if="form.type == 'mod'" @submit="pushMod">
            <v-card-text>
              <v-text-field
                v-model="publicForm.name"
                type="text"
                label="Mod name"
                outlined
              />
              <v-textarea
                v-model="publicForm.description"
                label="Description"
                outlined
              />
              <v-text-field
                v-model="publicForm.upload.filename"
                label="File"
                outlined
                readonly
              />
            </v-card-text>
            <v-card-actions>
              <small>
                Your {{ typeName }} is downloadable through the API at:
              </small>
              <code>
                {{ apiDownloadPath }}
              </code>
              <v-spacer />
              <v-btn type="submit" text color="primary">Publish</v-btn>
            </v-card-actions>
          </v-form>
        </div>
      </v-card>
    </v-col>

    <v-dialog v-model="error.active">
      <v-container>
        <v-card color="error">
          <v-card-title class="headline">Upload Error</v-card-title>
          <v-divider />
          <v-card-text>
            <p>An error occurred while uploading your {{ typeName }}.</p>
            <p>The server said:</p>
            <ul>
              <p v-for="message in error.messages" :key="message">
                {{ message }}
              </p>
            </ul>
            <p>Sorry about that.</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn text @click.stop="error.active = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  middleware: 'auth',
  data() {
    return {
      step: 0,
      form: {
        type: '',
        file: null,
      },
      publicForm: {
        upload: null,
        name: '',
        description: '',
      },
      error: {
        active: false,
        statusCode: '',
        messages: [],
      },
    }
  },
  computed: {
    apiDownloadPath() {
      return `/api/upload/${this.publicForm.upload.slug}`
    },
    typeName() {
      return this.form.type
    },
  },
  layout: 'landing',
  methods: {
    selectFile() {
      this.$refs.fileSelect.click()
    },
    async startUpload(evt) {
      this.form.file = evt.target.files[0]

      const formData = new FormData()
      formData.append('type', this.form.type)
      formData.append('file', this.form.file)

      try {
        const response = await this.$axios.post('/api/upload', formData)
        this.publicForm.upload = response.data.result
        this.step++
      } catch (err) {
        if (err.response) {
          this.showErrorModal(err.response.status, err.response.data)
        } else {
          this.showErrorModal('', {
            errors: [err.message],
          })
        }
      }
    },
    showErrorModal(statusCode, payload) {
      this.error.statusCode = statusCode
      this.error.messages = payload.errors
      this.error.active = true
    },
    startSkin() {
      this.form.type = 'skin'
      this.step++
    },
    startMod() {
      this.form.type = 'mod'
      this.step++
    },
    async pushSkin() {
      try {
        const response = await this.$axios.post('/api/skin', this.publicForm)
        this.$router.replace(
          `/skin/${this.$auth.user.username}/${response.data.result.slug}`,
        )
      } catch (err) {
        this.$nuxt.error(err)
      }
    },
    pushMod() {
      // nyi
    },
  },
}
</script>
