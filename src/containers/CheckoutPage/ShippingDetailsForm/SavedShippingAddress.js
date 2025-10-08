import classNames from 'classnames';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '../../../components';
import css from './SavedShippingAddress.module.css';

/**
 * SavedShippingAddress is a component that displays a saved shipping address.
 * @param {Object} address - The address to display.
 * @param {Object} className - The class name for the component.
 * @param {Object} rootClassName - The root class name for the component.
 * @param {Object} onEdit - The function to call when the edit button is clicked.
 * @param {Object} onNextStep - The function to call when the next shipping rate button is clicked.
 * @param {boolean} disabledNextStep - Whether the next shipping rate button is disabled.
 * @returns {JSX.Element} - The SavedShippingAddress component.
 */
const SavedShippingAddress = ({
  address,
  className,
  rootClassName,
  onEdit,
  onNextStep,
  disabledNextStep,
}) => {
  const classes = classNames(rootClassName || css.root, className);
  const { name, street1, streetNo, city, state, zip, phone } = address || {};
  return (
    <div className={classes}>
      <div className={css.addressContainer}>
        <div className={css.addressInfo}>
          <p className={css.name}>{name}</p>
          {phone && <p className={css.phone}>{phone}</p>}
          <p className={css.street}>{`${street1} ${streetNo ?? ''}`}</p>
          <p className={css.city}>{`${city}, ${state} ${zip}`}</p>
        </div>
        <Button onClick={onEdit} type="button" className={css.changeButton}>
          <FormattedMessage id="SavedShippingAddress.change" />
        </Button>
      </div>
      <Button
        onClick={onNextStep}
        type="button"
        className={css.nextStepButton}
        disabled={disabledNextStep}
      >
        <FormattedMessage id="SavedShippingAddress.nextShippingMethod" />
      </Button>
    </div>
  );
};

export default SavedShippingAddress;
