import React from 'react';
import classNames from 'classnames';

import getCountryCodes from '../../../translations/countryCodes';
import { FormattedMessage } from '../../../util/reactIntl';
import { ExternalLink, Heading } from '../../../components';
import { formatPhoneNumber } from 'react-phone-number-input';

import AddressLinkMaybe from './AddressLinkMaybe';

import css from './TransactionPanel.module.css';
import Spinner from '../../../components/IconSpinner/IconSpinner';

// Functional component as a helper to build ActivityFeed section
const DeliveryInfoMaybe = props => {
  const {
    className,
    rootClassName,
    protectedData,
    listing,
    locale,
    shippingLabelDetails,
    isProvider,
  } = props;
  const classes = classNames(rootClassName || css.deliveryInfoContainer, className);
  const deliveryMethod = protectedData?.deliveryMethod;
  const isShipping = deliveryMethod === 'shipping';
  const isPickup = deliveryMethod === 'pickup';
  if (isPickup) {
    const pickupLocation = listing?.attributes?.publicData?.location || {};
    return (
      <div className={classes}>
        <Heading as="h3" rootClassName={css.sectionHeading}>
          <FormattedMessage id="TransactionPanel.pickupInfoHeading" />
        </Heading>
        <div className={css.pickupInfoContent}>
          <AddressLinkMaybe
            linkRootClassName={css.pickupAddress}
            location={pickupLocation}
            geolocation={listing?.attributes?.geolocation}
            showAddress={true}
          />
        </div>
      </div>
    );
  } else if (isShipping) {
    const {
      name,
      phone: phoneNumber,
      street: line1,
      streetNumber: line2,
      city,
      zip: postalCode,
      state,
      country: countryCode,
    } = protectedData?.shippingAddress || {};
    const phoneMaybe = !!phoneNumber ? (
      <>
        {formatPhoneNumber(phoneNumber)}
        <br />
      </>
    ) : null;

    const countryCodes = getCountryCodes(locale);
    const countryInfo = countryCodes.find(c => c.code === countryCode);
    const country = countryInfo?.name;

    const trackingNumber = shippingLabelDetails?.trackingNumber;
    const trackingUrl = shippingLabelDetails?.trackingUrl;
    const labelUrl = shippingLabelDetails?.labelUrl;
    const hasTrackingValue = !!trackingNumber || !!trackingUrl || !!labelUrl;

    return (
      <div className={classes}>
        <Heading as="h3" rootClassName={css.sectionHeading}>
          <FormattedMessage id="TransactionPanel.shippingInfoHeading" />
        </Heading>
        <div className={css.shippingInfoContent}>
          {name}
          <br />
          {phoneMaybe}
          {line1}
          {line2 ? `, ${line2}` : ''}
          <br />
          {postalCode}, {city}
          <br />
          {state ? `${state}, ` : ''}
          {country}
          <br />
        </div>

        <div className={css.shippingDetailsContainer}>
          {hasTrackingValue ? (
            <>
              <Heading as="h3" rootClassName={css.sectionHeading}>
                <FormattedMessage id="TransactionPanel.shippingDetailsHeading" />
              </Heading>
              <div className={css.shippingDetailsContent}>
                <p>
                  <FormattedMessage id="TransactionPanel.trackingNumber" />: {trackingNumber}
                </p>
                {trackingUrl ? (
                  <p>
                    <ExternalLink href={trackingUrl}>
                      <FormattedMessage id="TransactionPanel.trackingUrl" />
                    </ExternalLink>
                  </p>
                ) : null}
                {labelUrl && isProvider ? (
                  <p>
                    <ExternalLink href={labelUrl}>
                      <FormattedMessage id="TransactionPanel.labelUrl" />
                    </ExternalLink>
                  </p>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <Heading as="h3" rootClassName={css.sectionHeading}>
                <FormattedMessage id="TransactionPanel.weArePreparingYourOrder" />
              </Heading>
            </>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default DeliveryInfoMaybe;
