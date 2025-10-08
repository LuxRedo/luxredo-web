import { validateAddress } from '../components/ShippingAddressForm/ShippingAddressForm.duck';

const { useDispatch, useSelector } = require('react-redux');

const useValidateShippingAddress = () => {
  const dispatch = useDispatch();
  const { validateAddressError, validateAddressInProgress } = useSelector(
    state => state.ShippingAddressForm
  );

  const onValidateShippingAddress = address => {
    return dispatch(validateAddress(address));
  };

  return { onValidateShippingAddress, validateAddressError, validateAddressInProgress };
};

export default useValidateShippingAddress;
