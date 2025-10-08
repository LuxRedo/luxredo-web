import get from 'lodash/get';
import { AddressApis } from '../../util/api';
import * as log from '../../util/log';
import { fetchCurrentUser } from '../../ducks/user.duck';

export const LOAD_DATA_SUCCESS = 'app/ShippingAddressForm/LOAD_DATA_SUCCESS';
export const VALIDATE_ADDRESS_REQUEST = 'app/ShippingAddressForm/VALIDATE_ADDRESS_REQUEST';
export const VALIDATE_ADDRESS_SUCCESS = 'app/ShippingAddressForm/VALIDATE_ADDRESS_SUCCESSv';
export const VALIDATE_ADDRESS_ERROR = 'app/ShippingAddressForm/VALIDATE_ADDRESS_ERROR';

const initialState = {
  validateAddressInProgress: false,
  validateAddressSuccess: null,
  validateAddressError: null,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case LOAD_DATA_SUCCESS:
      return { ...state, initialValues: payload };

    case VALIDATE_ADDRESS_REQUEST:
      return {
        ...state,
        validateAddressInProgress: true,
        validateAddressSuccess: null,
        validateAddressError: null,
      };
    case VALIDATE_ADDRESS_SUCCESS:
      return { ...state, validateAddressInProgress: false, validateAddressSuccess: true };
    case VALIDATE_ADDRESS_ERROR:
      return { ...state, validateAddressInProgress: false, validateAddressError: payload };

    default:
      return state;
  }
}

// ---

export const loadDataSuccess = shippingAdress => ({
  type: LOAD_DATA_SUCCESS,
  payload: shippingAdress,
});

export const validateAddressRequest = () => ({
  type: VALIDATE_ADDRESS_REQUEST,
});
export const validateAddressSuccess = () => ({
  type: VALIDATE_ADDRESS_SUCCESS,
});
export const validateAddressError = error => ({
  type: VALIDATE_ADDRESS_ERROR,
  payload: { error },
});

// ---

export const validateAddress = address => async (dispatch, getState, sdk) => {
  if (!address) {
    return;
  }

  try {
    dispatch(validateAddressRequest());

    const response = await AddressApis.validateAddress({ address });
    const validationResults = get(response, 'validationResults', null);

    if (!validationResults?.isValid) {
      const errorMsg = get(validationResults, 'messages[0].text');
      throw new Error(errorMsg);
    }

    const { street1, street_no, city, state, zip, country, name, objectId } = response;
    await sdk.currentUser.updateProfile({
      protectedData: {
        shippingAddress: {
          street1,
          streetNo: street_no,
          city,
          state,
          zip,
          country,
          name,
          phone: address.phone,
          id: objectId,
        },
      },
    });

    await dispatch(fetchCurrentUser());

    dispatch(validateAddressSuccess());

    return response;
  } catch (e) {
    log.error(e, 'validate-address-failed', { address: address });
    dispatch(validateAddressError(e));
    throw e;
  }
};
