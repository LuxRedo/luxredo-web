import * as log from '../../util/log';
import { fetchCurrentUser } from '../../ducks/user.duck';

export const LOAD_DATA_SUCCESS = 'app/ShippingAddressForm/LOAD_DATA_SUCCESS';
export const UPDATE_SHIPPING_ADDRESS_REQUEST =
  'app/ShippingAddressForm/UPDATE_SHIPPING_ADDRESS_REQUEST';
export const UPDATE_SHIPPING_ADDRESS_SUCCESS =
  'app/ShippingAddressForm/UPDATE_SHIPPING_ADDRESS_SUCCESS';
export const UPDATE_SHIPPING_ADDRESS_ERROR =
  'app/ShippingAddressForm/UPDATE_SHIPPING_ADDRESS_ERROR';

const initialState = {
  updateShippingAddressInProgress: false,
  updateShippingAddressSuccess: null,
  updateShippingAddressError: null,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case LOAD_DATA_SUCCESS:
      return { ...state, initialValues: payload };

    case UPDATE_SHIPPING_ADDRESS_REQUEST:
      return {
        ...state,
        updateShippingAddressInProgress: true,
        updateShippingAddressSuccess: null,
        updateShippingAddressError: null,
      };
    case UPDATE_SHIPPING_ADDRESS_SUCCESS:
      return {
        ...state,
        updateShippingAddressInProgress: false,
        updateShippingAddressSuccess: true,
      };
    case UPDATE_SHIPPING_ADDRESS_ERROR:
      return {
        ...state,
        updateShippingAddressInProgress: false,
        updateShippingAddressError: payload,
      };

    default:
      return state;
  }
}

// ---

export const loadDataSuccess = shippingAddress => ({
  type: LOAD_DATA_SUCCESS,
  payload: shippingAddress,
});

export const updateShippingAddressRequest = () => ({
  type: UPDATE_SHIPPING_ADDRESS_REQUEST,
});
export const updateShippingAddressSuccess = () => ({
  type: UPDATE_SHIPPING_ADDRESS_SUCCESS,
});
export const updateShippingAddressError = error => ({
  type: UPDATE_SHIPPING_ADDRESS_ERROR,
  payload: { error },
});

// ---

export const updateShippingAddress = address => async (dispatch, getState, sdk) => {
  if (!address) {
    return;
  }

  try {
    dispatch(updateShippingAddressRequest());

    const response = await sdk.currentUser.updateProfile({
      protectedData: {
        shippingAddress: address,
      },
    });

    await dispatch(fetchCurrentUser());

    dispatch(updateShippingAddressSuccess());

    return response;
  } catch (e) {
    log.error(e, 'update-shipping-address-failed', { address: address });
    dispatch(updateShippingAddressError(e));
    throw e;
  }
};
