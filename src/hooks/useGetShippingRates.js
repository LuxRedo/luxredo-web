import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { getShippingRates } from '../containers/CheckoutPage/CheckoutPage.duck';

const useGetShippingRates = ({ tx, currentUser, listing }) => {
  const { customer, provider } = tx;
  const customerId = customer?.id?.uuid;
  const providerId = provider?.id?.uuid;
  const dispatch = useDispatch();
  const shipment = useSelector(state => state.CheckoutPage.shipment);
  const getShippingRatesInProgress = useSelector(
    state => state.CheckoutPage.getShippingRatesInProgress
  );
  const getShippingRatesError = useSelector(state => state.CheckoutPage.getShippingRatesError);
  const listingId = listing?.id?.uuid;
  const onGetShippingRates = (providerId, customerId, listingId) => {
    dispatch(getShippingRates({ providerId, customerId, listingId }));
  };

  const shippingAddress = currentUser?.attributes?.profile?.protectedData?.shippingAddress || {};
  const { street1, city, country, phone, zip, state } = shippingAddress;
  const hasEnoughShippingAddressFields = !!(street1 && city && country && phone && zip && state);

  useEffect(() => {
    if (hasEnoughShippingAddressFields && providerId && customerId && listingId) {
      onGetShippingRates(providerId, customerId, listingId);
    }
  }, [
    JSON.stringify(shippingAddress),
    hasEnoughShippingAddressFields,
    providerId,
    customerId,
    listingId,
  ]);
  return {
    shipment,
    getShippingRatesInProgress,
    getShippingRatesError,
    hasEnoughShippingAddressFields,
  };
};
export default useGetShippingRates;
