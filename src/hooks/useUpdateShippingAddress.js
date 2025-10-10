import { updateShippingAddress } from '../components/ShippingAddressForm/ShippingAddressForm.duck';

const { useDispatch, useSelector } = require('react-redux');

const onUpdateShippingAddress = () => {
  const dispatch = useDispatch();
  const { updateShippingAddressError, updateShippingAddressInProgress } = useSelector(
    state => state.ShippingAddressForm
  );

  const onUpdateShippingAddress = address => {
    return dispatch(updateShippingAddress(address));
  };

  return { onUpdateShippingAddress, updateShippingAddressError, updateShippingAddressInProgress };
};

export default onUpdateShippingAddress;
