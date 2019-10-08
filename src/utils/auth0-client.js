import createAuth0Client from '@auth0/auth0-spa-js'
import routes from '../routes'

const auth0Options = {
    domain: window.AUTH0_DOMAIN,
    client_id: window.AUTH0_CLIENT_ID,
    audience: window.AUTH0_AUDIENCE,
    redirect_uri: `${window.location.origin}${routes.oauth}`
  }

class Auth0Client {
    create() {
        if (this.auth0Promise) return this.auth0Promise
        this.auth0Promise = createAuth0Client(auth0Options)
        return this.auth0Promise
    }
}

const auth0Client = new Auth0Client()

export default auth0Client