import { useEffect } from 'react';
import { fetchSpeculatedTransactionIfNeeded as fetchSpeculatedTransactionIfNeededWithRates } from '../CheckoutPageWithPayment';
import { useSelector } from 'react-redux';

const useFetchSpeculatedTransactionWithRate = ({
  fetchSpeculatedTransaction,
  pageData,
  orderParams,
  rate,
}) => {
  const reSpeculateInProgress = useSelector(state => state.CheckoutPage.reSpeculateInProgress);
  useEffect(() => {
    if (rate) {
      fetchSpeculatedTransactionIfNeededWithRates(
        {
          ...orderParams,
          shippingRateId: rate.objectId,
        },
        pageData,
        fetchSpeculatedTransaction
      );
    }
  }, [JSON.stringify(orderParams), JSON.stringify(pageData), JSON.stringify(rate)]);
  return { reSpeculateInProgress };
};

export default useFetchSpeculatedTransactionWithRate;
