import React from 'react';
import css from './ShippingMethodForm.module.css';
import Spinner from '../../../components/IconSpinner/IconSpinner';
import classNames from 'classnames';
import { Button } from '../../../components';
import { FormattedMessage } from '../../../util/reactIntl';

const formatMoneyWithCurrency = (value, currency) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * @param {Object} props
 * @param {Object[]} props.shippingRates
 * @param {boolean} props.getShippingRatesInProgress
 * @param {Object} props.getShippingRatesError
 * @param {Function} props.onSelectShippingRate
 * @param {Object} props.selectedShippingRate
 * @param {Function} props.onNextStep - The function to call when the next step is clicked
 * @param {boolean} props.disabledNextStep - Whether the next step is disabled
 */
const ShippingMethodForm = ({
  shippingRates,
  getShippingRatesInProgress,
  getShippingRatesError,
  onSelectShippingRate,
  selectedShippingRate,
  onNextStep,
  disabledNextStep,
}) => {
  if (getShippingRatesError) {
    return <div className={css.error}>{getShippingRatesError.message ?? 'Unknown error'}</div>;
  }

  if (getShippingRatesInProgress) {
    return <Spinner />;
  }

  return (
    <div className={css.ratesContainer}>
      {shippingRates.length === 0 ? (
        <div className={css.noRates}>
          <FormattedMessage id="ShippingMethodForm.noRates" />
        </div>
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
            <div className={css.ratePrice}>
              {formatMoneyWithCurrency(rate.amount, rate.currency)}
            </div>
          </div>
        ))
      )}
      <Button
        type="submit"
        disabled={disabledNextStep}
        className={css.submitButton}
        onClick={onNextStep}
      >
        <FormattedMessage id="ShippingMethodForm.submit" />
      </Button>
    </div>
  );
};

export default ShippingMethodForm;
