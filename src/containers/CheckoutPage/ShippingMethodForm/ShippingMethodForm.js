import React from 'react';
import css from './ShippingMethodForm.module.css';
import Spinner from '../../../components/IconSpinner/IconSpinner';
import classNames from 'classnames';
import { PrimaryButton } from '../../../components';
import { FormattedMessage, useIntl } from '../../../util/reactIntl';
import { formatMoneyFromNumber } from '../../../util/currency';

const getShippingRateErrorMessages = shipment => {
  if (!shipment || !shipment?.addressFrom || !shipment?.addressTo) {
    return {
      addressFromMessages: [],
      addressToMessages: [],
    };
  }
  const addressFrom = shipment?.addressFrom;
  const addressTo = shipment?.addressTo;
  const addressFromMessages = [];
  const addressToMessages = [];
  const addressFromValidationResults = addressFrom?.validationResults;
  const addressToValidationResults = addressTo?.validationResults;
  if (!addressFromValidationResults?.isValid) {
    addressFromMessages.push(
      ...addressFromValidationResults?.messages
        ?.filter(message => message.type.includes('_error') || message.type.includes('_warning'))
        .map(message => message.text)
    );
  }
  if (!addressToValidationResults?.isValid) {
    addressToMessages.push(
      ...addressToValidationResults?.messages
        ?.filter(
          message => message?.type?.includes('_error') || message?.type?.includes('_warning')
        )
        .map(message => message.text)
    );
  }

  return {
    addressFromMessages,
    addressToMessages,
  };
};

const getFormattedErrorMessage = error => {
  if (!error) {
    return {
      errorMessagesTo: [],
      errorMessagesFrom: [],
    };
  }
  const errorBody = JSON.parse(error.error);
  const { address_to: addressTo, address_from: addressFrom } = errorBody;
  const errorMessagesTo = addressTo?.map(item => Object.values(item || {})).flat();
  const errorMessagesFrom = addressFrom?.map(item => Object.values(item || {})).flat();
  return {
    errorMessagesTo,
    errorMessagesFrom,
  };
};

const getErrorMessageIfNoRates = shipment => {
  const rates = shipment?.rates || [];
  if (rates?.length === 0) {
    const { messages } = shipment;
    return messages.map(message => message.text);
  }
  return [];
};

/**
 * @param {Object} props
 * @param {Object[]} props.shipment
 * @param {boolean} props.getShippingRatesInProgress
 * @param {Object} props.getShippingRatesError
 * @param {Function} props.onSelectShippingRate
 * @param {Object} props.selectedShippingRate
 * @param {Function} props.onNextStep - The function to call when the next step is clicked
 * @param {boolean} props.disabledNextStep - Whether the next step is disabled
 */
const ShippingMethodForm = ({
  shipment,
  getShippingRatesInProgress,
  getShippingRatesError,
  onSelectShippingRate,
  selectedShippingRate,
  onNextStep,
  disabledNextStep,
}) => {
  const intl = useIntl();

  if (getShippingRatesInProgress) {
    return <Spinner />;
  }
  const shippingRates = shipment.rates
    ? shipment.rates.sort((a, b) => Number(a.amount) - Number(b.amount))
    : [];
  const { addressFromMessages, addressToMessages } = getShippingRateErrorMessages(shipment);
  const { errorMessagesTo, errorMessagesFrom } = getFormattedErrorMessage(getShippingRatesError);

  const fromMessages = addressFromMessages?.length > 0 ? addressFromMessages : errorMessagesFrom;
  const toMessages = addressToMessages?.length > 0 ? addressToMessages : errorMessagesTo;
  const noRatesMessages = getErrorMessageIfNoRates(shipment);

  return (
    <div className={css.ratesContainer}>
      {noRatesMessages?.length > 0 && (
        <div className={css.noRatesContainer}>
          <p className={css.errorMessageTitle}>
            <FormattedMessage id="ShippingMethodForm.noRatesWithErrors" />
          </p>
          <div className={css.noRatesMessages}>
            {noRatesMessages.map((message, index) => (
              <div className={css.errorMessage} key={message}>
                {noRatesMessages.length > 1 ? `${index + 1}.` : ''} {message}
              </div>
            ))}
          </div>
        </div>
      )}
      {fromMessages?.length > 0 || toMessages?.length > 0 ? (
        fromMessages?.length > 0 || toMessages?.length > 0 ? (
          <div className={css.errorMessageContainer}>
            {fromMessages?.length > 0 && (
              <p className={css.errorMessageTitle}>
                <FormattedMessage id="ShippingMethodForm.addressFromError" />
              </p>
            )}
            {fromMessages?.map((message, index) => (
              <div className={css.errorMessage} key={message}>
                {fromMessages.length > 1 ? `${index + 1}.` : ''} {message}
              </div>
            ))}
            {toMessages?.length > 0 && (
              <p className={css.errorMessageTitle}>
                <FormattedMessage id="ShippingMethodForm.addressToError" />
              </p>
            )}
            {toMessages?.map((message, index) => (
              <div className={css.errorMessage} key={message}>
                {toMessages.length > 1 ? `${index + 1}.` : ''} {message}
              </div>
            ))}
          </div>
        ) : (
          <div className={css.noRates}>
            <FormattedMessage id="ShippingMethodForm.noRates" />
          </div>
        )
      ) : (
        shippingRates.map(rate => (
          <div
            role="button"
            key={rate.objectId}
            className={classNames(css.rate, {
              [css.selected]: selectedShippingRate?.objectId === rate.objectId,
            })}
            onClick={() => onSelectShippingRate(rate)}
          >
            <div className={css.rateHeader}>
              <img src={rate.providerImage200} alt={rate.name} className={css.providerImage} />
              <div className={css.rateDetails}>
                <div className={css.rateName}>
                  <span>{rate.provider}</span>

                  {rate.servicelevel && (
                    <span className={css.rateServiceLevel}>({rate.servicelevel.name})</span>
                  )}
                </div>
                <div className={css.rateDuration}>{rate.durationTerms}</div>
              </div>
            </div>
            <div className={css.ratePrice}>{formatMoneyFromNumber(intl, rate)}</div>
          </div>
        ))
      )}
      <PrimaryButton
        type="submit"
        disabled={disabledNextStep || fromMessages?.length > 0 || toMessages?.length > 0}
        className={css.submitButton}
        onClick={onNextStep}
      >
        <FormattedMessage id="ShippingMethodForm.submit" />
      </PrimaryButton>
    </div>
  );
};

export default ShippingMethodForm;
