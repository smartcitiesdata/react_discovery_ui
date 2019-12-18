import { useEffect, useState } from 'react'
import { Redirect } from 'react-router'
import './oauth-view.scss'
import routes from '../../routes'
import qs from 'qs'
import LoadingElement from '../../components/generic-elements/loading-element'
import ErrorComponent from '../../components/generic-elements/error-component'
import PropTypes from 'prop-types'

const hasAuthorizationCodeParameter = search => {
  return qs.parse(search, { ignoreQueryPrefix: true }).hasOwnProperty('code')
}

const OAuthView = (props) => {
  const {
    callLoggedIn,
    history: {location: { search }},
    auth: { handleRedirectCallback, isLoading},
  } = props

  const [handled, setHandled] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const onMount = async () => {
      if (hasAuthorizationCodeParameter(search)) {
        try {
          await handleRedirectCallback()
          callLoggedIn()
        } 
        catch {
          setIsError(true) 
        }
      }
      setHandled(true)
    }
    onMount()
  }, [])


  if (isError) {
    return (
        <Redirect to={{pathname: routes.root, state: {isError: true, errorMessage: 'Your login attempt was not successful. Please try again.'}}} />
   )
  } else {
  return (
    <oauth-view>
    {
      isLoading || !handled
        ? <LoadingElement />
        : <Redirect to={{pathname: routes.root}} />
    }
    </oauth-view>
  )
  }
}

OAuthView.propTypes = {
  callLoggedIn: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  auth: PropTypes.shape({
    handleRedirectCallback: PropTypes.func.isRequired,
    isLoading: PropTypes.bool
  }).isRequired
}

export default OAuthView
