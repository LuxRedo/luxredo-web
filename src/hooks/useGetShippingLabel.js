import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShippingLabelDetails } from '../containers/TransactionPage/TransactionPage.duck';
import { isEmpty } from 'lodash';

/**
 * Hook to get shipping label details for a transaction
 * Because after initiateOrder, the shipping label is created but not available immediately
 * so we need to poll for the shipping label details
 * @param {string} txId - The ID of the transaction
 * @returns {Object} - The shipping label details
 */

const useGetShippingLabel = txId => {
  const { shippingLabelDetails } = useSelector(state => state.TransactionPage);
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  const errorCountRef = useRef(0);
  useEffect(() => {
    if (txId && !shippingLabelDetails) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Start polling for shipping label details
      intervalRef.current = setInterval(async () => {
        // Check if shipping label details are now available
        const hasEnoughData =
          shippingLabelDetails?.trackingNumber &&
          shippingLabelDetails?.trackingUrl &&
          shippingLabelDetails?.labelUrl;
        if (hasEnoughData) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else {
          // Fetch shipping label details if not available
          const success = await dispatch(fetchShippingLabelDetails(txId));
          if (!success) {
            errorCountRef.current += 1;
            if (errorCountRef.current > 5) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
          }
        }
      }, 5000);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [txId, shippingLabelDetails, dispatch]);

  // Return the shipping label details for convenience
  return shippingLabelDetails;
};

export default useGetShippingLabel;
