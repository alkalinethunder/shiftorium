<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div class="text-center">
        <img src="/branding/shiftos.png" />
      </div>
      <v-card>
        <v-card-title class="headline">
          Welcome to the Shiftorium
        </v-card-title>
        <v-card-text>
          <p>
            The Shiftorium is your one-stop shop for downloading and creating
            user-created mods and skins for ShiftOS and The Shiftnet.
          </p>
          <v-row>
            <v-col>
              <div class="text-center">
                <h3 class="display-2">0</h3>
                <p>Published Skins</p>
                <v-btn to="/app/skins">Browse Skins</v-btn>
              </div>
            </v-col>
            <v-col>
              <div class="text-center">
                <h3 class="display-2">0</h3>
                <p>Published Mods</p>
                <v-btn to="/app/mods">Browse Mods</v-btn>
              </div>
            </v-col>
            <v-col>
              <div class="text-center">
                <h3 class="display-2">0</h3>
                <p>Active Shifters</p>
                <div v-if="$auth.loggedIn">
                  <v-btn to="/app/profile">My Profile</v-btn>
                </div>
                <div v-else>
                  <small>
                    <nuxt-link to="/auth/login">Log in</nuxt-link>
                    or
                    <nuxt-link to="/auth/signup">create an account</nuxt-link>
                    to become a part of this community!
                  </small>
                </div>
              </div>
            </v-col>
          </v-row>
          <hr class="my-3" />
          <small>
            &copy; 2020 &bull; Developed by
            <a href="https://mvanoverbeek.me/">Michael VanOverbeek</a>
          </small>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  layout: 'landing',
}
</script>
